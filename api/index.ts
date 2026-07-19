import {
  adminEmailAddress,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminAuthConfigurationError,
  getAdminSessionFromCookie,
  isAdminAuthConfigured,
  verifyAdminCredentials
} from "./admin/_auth.js";
import { readJsonBody, requireAdminRequest, tooManyRequestsResponse } from "./admin/_shared.js";
import { sendInquiryNotification } from "../server/lib/inquiryNotifications.js";
import { createInquiry, deleteInquiry, getInquiries, updateInquiryReplyStatus } from "../server/lib/inquiryStore.js";
import { validateInquiryPayload, type InquiryPayload } from "../server/lib/inquiryValidation.js";
import {
  clearMerchandiseImage,
  readMerchandiseImageMap,
  readMerchandiseImages,
  uploadMerchandiseImage
} from "../server/lib/merchandiseImageStore.js";
import {
  cancelMerchandiseReservation,
  createMerchandiseReservation,
  MerchandiseReservationError,
  pingMerchandiseDatabase,
  readMerchandiseInventory,
  readMerchandiseOrders,
  updateMerchandiseInventoryQuantity,
  type MerchandiseReservationPayload
} from "../server/lib/merchandiseReservationStore.js";
import {
  getMerchandiseReceiptEmailConfigurationError,
  isMerchandiseReceiptEmailConfigured,
  isMerchandiseReceiptEmailDeliveryRequired,
  sendMerchandiseReceiptNotification
} from "../server/lib/merchandiseReceiptNotifications.js";
import { buildRateLimitHeaders, checkRateLimit, getClientIpFromRequestHeaders } from "../server/lib/rateLimit.js";
import { readSiteContent, validateSiteContent, writeSiteContent } from "../server/lib/siteContentStore.js";

type Handler = (request: Request, path: string) => Promise<Response> | Response;

const inquirySubmitRateLimit = { limit: 10, windowMs: 15 * 60 * 1000 };
const loginRateLimit = { limit: 5, windowMs: 10 * 60 * 1000 };
const merchandiseReservationRateLimit = { limit: 8, windowMs: 15 * 60 * 1000 };

function jsonError(error: string, status = 500) {
  return Response.json(
    {
      error
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

function normalizedRequestPath(request: Request) {
  const url = new URL(request.url);
  const rewrittenPath = url.searchParams.get("path");
  const pathname =
    url.pathname === "/api/index" && rewrittenPath
      ? `/api/${rewrittenPath.replace(/^\/+/, "")}`
      : url.pathname;

  return pathname.replace(/\/+$/, "") || "/";
}

function inquiryIdFromPath(path: string) {
  return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "");
}

function routeByMethod(handlers: Partial<Record<string, Handler>>, method: string, request: Request, path: string) {
  const handler = handlers[method];

  if (!handler) {
    return Response.json(
      {
        error: "Method not allowed."
      },
      {
        status: 405,
        headers: {
          "Cache-Control": "no-store",
          Allow: Object.keys(handlers).join(", ")
        }
      }
    );
  }

  return handler(request, path);
}

async function siteContentGet() {
  try {
    return Response.json(await readSiteContent(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return jsonError("The server hit an unexpected error.");
  }
}

async function siteContentPut(request: Request) {
  const adminGuard = requireAdminRequest(request, "site-content");

  if (adminGuard) {
    return adminGuard;
  }

  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return jsonError("Enter a valid JSON payload.", 400);
  }

  const validation = validateSiteContent(payload);

  if (!validation.ok) {
    return jsonError("Unable to validate the site content.", 400);
  }

  try {
    return Response.json(
      {
        content: await writeSiteContent(validation.data)
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch {
    return jsonError("The server hit an unexpected error.");
  }
}

async function publicInquiryPost(request: Request) {
  const rateLimit = checkRateLimit(`public-inquiry:${getClientIpFromRequestHeaders(request.headers)}`, inquirySubmitRateLimit);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many inquiry submissions. Please try again later."
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimit)
      }
    );
  }

  const payload = (await readJsonBody(request)) as InquiryPayload | null;

  if (!payload) {
    return jsonError("Enter a valid JSON payload.", 400);
  }

  const validation = validateInquiryPayload(payload);

  if (!validation.ok) {
    return jsonError(validation.error, 400);
  }

  try {
    const result = await createInquiry(validation.data);
    const notification = await sendInquiryNotification(validation.data);

    if (!notification.ok) {
      console.warn(notification.error);
    }

    return Response.json(
      {
        message: "Form submitted successfully.",
        total: result.total
      },
      {
        status: 201
      }
    );
  } catch {
    return jsonError("The server hit an unexpected error.");
  }
}

async function adminSessionGet(request: Request) {
  const session = getAdminSessionFromCookie(request.headers.get("cookie"));

  return Response.json(
    {
      authenticated: Boolean(session),
      email: session?.email ?? null
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

async function adminLoginPost(request: Request) {
  if (!isAdminAuthConfigured()) {
    return jsonError(getAdminAuthConfigurationError(), 503);
  }

  const rateLimit = checkRateLimit(`admin-login:${getClientIpFromRequestHeaders(request.headers)}`, loginRateLimit);

  if (!rateLimit.allowed) {
    return tooManyRequestsResponse(rateLimit, "Too many sign-in attempts. Please try again later.");
  }

  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return jsonError("Enter a valid JSON payload.", 400);
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!verifyAdminCredentials(email, password)) {
    return jsonError("Invalid admin email or password.", 401);
  }

  return Response.json(
    {
      authenticated: true,
      email: adminEmailAddress
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": createAdminSessionCookie()
      }
    }
  );
}

function adminLogoutPost() {
  return Response.json(
    {
      authenticated: false
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": clearAdminSessionCookie()
      }
    }
  );
}

async function adminInquiriesGet(request: Request) {
  const adminGuard = requireAdminRequest(request, "inquiries");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const limitParam = searchParams.get("limit");
    const parsedLimit =
      limitParam === null || limitParam === "" || limitParam === "all"
        ? null
        : Number.isFinite(Number(limitParam))
          ? Math.max(1, Math.min(500, Math.floor(Number(limitParam))))
          : 10;
    const replyStatuses = (searchParams.get("statuses") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter((value): value is "pending" | "complete" => value === "pending" || value === "complete");
    const interests = (searchParams.get("categories") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    return Response.json(
      await getInquiries({
        limit: parsedLimit,
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
        replyStatuses,
        interests
      }),
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError("The server hit an unexpected error.");
  }
}

async function adminInquiryPatch(request: Request, path: string) {
  const adminGuard = requireAdminRequest(request, "inquiry-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  const id = inquiryIdFromPath(path);
  const payload = await readJsonBody(request);
  const replyStatus = payload && typeof payload === "object" && payload.replyStatus === "complete" ? "complete" : "";

  if (!id) {
    return jsonError("Inquiry id is required.", 400);
  }

  if (!replyStatus) {
    return jsonError("A valid inquiry status is required.", 400);
  }

  try {
    const inquiry = await updateInquiryReplyStatus(id, replyStatus);

    if (!inquiry) {
      return jsonError("Inquiry not found.", 404);
    }

    return Response.json(
      {
        inquiry,
        message: "Inquiry marked complete."
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError("The server hit an unexpected error.");
  }
}

async function adminInquiryDelete(request: Request, path: string) {
  const adminGuard = requireAdminRequest(request, "inquiry-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  const id = inquiryIdFromPath(path);

  if (!id) {
    return jsonError("Inquiry id is required.", 400);
  }

  try {
    const deleted = await deleteInquiry(id);

    if (!deleted) {
      return jsonError("Inquiry not found.", 404);
    }

    return Response.json(
      {
        message: "Inquiry deleted."
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError("The server hit an unexpected error.");
  }
}

async function adminInventoryWithImages(inventory: Awaited<ReturnType<typeof readMerchandiseInventory>>) {
  const images = await readMerchandiseImageMap();

  return {
    ...inventory,
    inventory: inventory.inventory.map((row) => ({
      ...row,
      imageSrc: images[row.sku] ?? null
    }))
  };
}

async function adminMerchandiseInventoryGet(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-inventory");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    return Response.json(await adminInventoryWithImages(await readMerchandiseInventory()), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError(
      error instanceof MerchandiseReservationError ? error.message : "Unable to load merchandise inventory.",
      error instanceof MerchandiseReservationError ? error.statusCode : 500
    );
  }
}

async function adminMerchandiseInventoryPatch(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-inventory-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const result = await updateMerchandiseInventoryQuantity((await readJsonBody(request)) ?? {});
    const images = await readMerchandiseImageMap();

    return Response.json(
      {
        ...result,
        inventory: result.inventory.map((row) => ({
          ...row,
          imageSrc: images[row.sku] ?? null
        }))
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError(
      error instanceof MerchandiseReservationError ? error.message : "Unable to update merchandise quantity.",
      error instanceof MerchandiseReservationError ? error.statusCode : 500
    );
  }
}

async function adminMerchandiseOrdersGet(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-orders");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    return Response.json(await readMerchandiseOrders(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to load merchandise orders.");
  }
}

async function adminMerchandiseOrdersPatch(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-order-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    return Response.json(await cancelMerchandiseReservation(await request.json()), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError(
      error instanceof MerchandiseReservationError ? error.message : "Unable to cancel merchandise order.",
      error instanceof MerchandiseReservationError ? error.statusCode : 500
    );
  }
}

async function adminMerchandiseImagesGet(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-images");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    return Response.json(
      {
        images: await readMerchandiseImages()
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError("Unable to load merchandise images.");
  }
}

async function adminMerchandiseImagesPost(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-image-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const image = await uploadMerchandiseImage(await request.json());

    return Response.json(
      {
        image,
        message: "Merchandise image updated."
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Unable to update merchandise image.", 400);
  }
}

async function adminMerchandiseImagesDelete(request: Request, path: string) {
  const adminGuard = requireAdminRequest(request, "merchandise-image-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const url = new URL(request.url);
    const sku = url.searchParams.get("sku") ?? (path === "/api/admin/merchandise/images" ? "" : inquiryIdFromPath(path));
    const image = await clearMerchandiseImage(sku);

    return Response.json(
      {
        image,
        message: "Merchandise image removed."
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Unable to remove merchandise image.", 400);
  }
}

async function merchandiseInventoryGet() {
  try {
    return Response.json(await readMerchandiseInventory(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError(
      error instanceof MerchandiseReservationError ? error.message : "Unable to load merchandise inventory.",
      error instanceof MerchandiseReservationError ? error.statusCode : 500
    );
  }
}

async function merchandiseImagesGet() {
  try {
    return Response.json(
      {
        images: await readMerchandiseImages()
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);
    return jsonError("Unable to load merchandise images.");
  }
}

async function merchandiseHealthGet() {
  try {
    return Response.json(await pingMerchandiseDatabase(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        ok: false,
        error: error instanceof MerchandiseReservationError ? error.message : "Unable to check merchandise database."
      },
      {
        status: error instanceof MerchandiseReservationError ? error.statusCode : 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

async function merchandiseOrdersPost(request: Request) {
  const rateLimit = checkRateLimit(
    `merchandise-reservation:${getClientIpFromRequestHeaders(request.headers)}`,
    merchandiseReservationRateLimit
  );

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many merchandise reservations. Please try again later."
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          ...buildRateLimitHeaders(rateLimit)
        }
      }
    );
  }

  const payload = (await readJsonBody(request)) as MerchandiseReservationPayload | null;

  if (!payload) {
    return jsonError("Enter a valid JSON payload.", 400);
  }

  try {
    if (isMerchandiseReceiptEmailDeliveryRequired() && !isMerchandiseReceiptEmailConfigured()) {
      return jsonError(getMerchandiseReceiptEmailConfigurationError(), 503);
    }

    const result = await createMerchandiseReservation(payload);
    const receiptNotification = await sendMerchandiseReceiptNotification(result);

    if (!receiptNotification.ok) {
      console.warn(receiptNotification.error);
    }

    return Response.json(
      {
        message: "Order reserved for event pickup.",
        receiptEmail: {
          sent: receiptNotification.ok
        },
        ...result
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    if (error instanceof MerchandiseReservationError) {
      return Response.json(
        {
          error: error.message,
          ...(error.inventory ? { inventory: error.inventory } : {})
        },
        {
          status: error.statusCode,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    console.error(error);
    return jsonError("Unable to reserve the selected merchandise.");
  }
}

async function dispatch(request: Request) {
  const method = request.method.toUpperCase();
  const path = normalizedRequestPath(request);

  if (path === "/api/health") {
    return routeByMethod({ GET: () => Response.json({ status: "ok" }) }, method, request, path);
  }

  if (path === "/api/site-content") {
    return routeByMethod({ GET: siteContentGet, PUT: siteContentPut }, method, request, path);
  }

  if (path === "/api/inquiries") {
    return routeByMethod({ POST: publicInquiryPost }, method, request, path);
  }

  if (path === "/api/admin/session") {
    return routeByMethod({ GET: adminSessionGet }, method, request, path);
  }

  if (path === "/api/admin/login") {
    return routeByMethod({ POST: adminLoginPost }, method, request, path);
  }

  if (path === "/api/admin/logout") {
    return routeByMethod({ POST: adminLogoutPost }, method, request, path);
  }

  if (path === "/api/admin/inquiries") {
    return routeByMethod({ GET: adminInquiriesGet }, method, request, path);
  }

  if (/^\/api\/admin\/inquiries\/[^/]+$/.test(path)) {
    return routeByMethod({ PATCH: adminInquiryPatch, DELETE: adminInquiryDelete }, method, request, path);
  }

  if (path === "/api/admin/merchandise/inventory") {
    return routeByMethod({ GET: adminMerchandiseInventoryGet, PATCH: adminMerchandiseInventoryPatch }, method, request, path);
  }

  if (path === "/api/admin/merchandise/orders") {
    return routeByMethod({ GET: adminMerchandiseOrdersGet, PATCH: adminMerchandiseOrdersPatch }, method, request, path);
  }

  if (path === "/api/admin/merchandise/images" || /^\/api\/admin\/merchandise\/images\/[^/]+$/.test(path)) {
    return routeByMethod(
      { GET: adminMerchandiseImagesGet, POST: adminMerchandiseImagesPost, DELETE: adminMerchandiseImagesDelete },
      method,
      request,
      path
    );
  }

  if (path === "/api/merchandise/inventory") {
    return routeByMethod({ GET: merchandiseInventoryGet }, method, request, path);
  }

  if (path === "/api/merchandise/images") {
    return routeByMethod({ GET: merchandiseImagesGet }, method, request, path);
  }

  if (path === "/api/merchandise/health") {
    return routeByMethod({ GET: merchandiseHealthGet }, method, request, path);
  }

  if (path === "/api/merchandise/orders") {
    return routeByMethod({ POST: merchandiseOrdersPost }, method, request, path);
  }

  return Response.json(
    {
      error: "API route not found."
    },
    {
      status: 404,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export function GET(request: Request) {
  return dispatch(request);
}

export function POST(request: Request) {
  return dispatch(request);
}

export function PUT(request: Request) {
  return dispatch(request);
}

export function PATCH(request: Request) {
  return dispatch(request);
}

export function DELETE(request: Request) {
  return dispatch(request);
}
