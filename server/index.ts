import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import {
  adminEmailAddress,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminAuthConfigurationError,
  getAdminSessionFromCookie,
  isAdminAuthConfigured,
  isAdminSessionValid,
  verifyAdminCredentials
} from "./lib/adminAuth";
import {
  readSiteContent,
  validateSiteContent,
  writeSiteContent
} from "./lib/siteContentStore";
import { createInquiry, deleteInquiry, getInquiries, updateInquiryReplyStatus } from "./lib/inquiryStore";
import { sendInquiryNotification } from "./lib/inquiryNotifications";
import { InquiryPayload, validateInquiryPayload } from "./lib/inquiryValidation";
import {
  cancelMerchandiseReservation,
  createMerchandiseReservation,
  MerchandiseReservationError,
  MerchandiseReservationPayload,
  pingMerchandiseDatabase,
  readMerchandiseInventory,
  readMerchandiseOrders,
  updateMerchandiseInventoryQuantity
} from "./lib/merchandiseReservationStore";
import {
  getMerchandiseReceiptEmailConfigurationError,
  isMerchandiseReceiptEmailConfigured,
  isMerchandiseReceiptEmailDeliveryRequired,
  sendMerchandiseReceiptNotification
} from "./lib/merchandiseReceiptNotifications";
import {
  clearMerchandiseImage,
  readMerchandiseImageMap,
  readMerchandiseImages,
  uploadMerchandiseImage
} from "./lib/merchandiseImageStore";
import { buildRateLimitHeaders, checkRateLimit, getClientIpFromNodeHeaders } from "./lib/rateLimit";

const app = express();
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3001);
const clientDistPath = path.resolve(process.cwd(), "dist/client");
const devCorsOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"];
const loginRateLimit = { limit: 5, windowMs: 10 * 60 * 1000 };
const adminApiRateLimit = { limit: 120, windowMs: 15 * 60 * 1000 };
const inquirySubmitRateLimit = { limit: 10, windowMs: 15 * 60 * 1000 };
const merchandiseReservationRateLimit = { limit: 8, windowMs: 15 * 60 * 1000 };

function resolveCorsOrigins() {
  if (process.env.CORS_ORIGIN?.trim()) {
    return process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return false;
  }

  return devCorsOrigins;
}

function applyRateLimit(
  request: express.Request,
  response: express.Response,
  scope: string,
  config: { limit: number; windowMs: number }
) {
  const ip = getClientIpFromNodeHeaders(request.headers as Record<string, string | string[] | undefined>);
  const result = checkRateLimit(`${scope}:${ip}`, config);

  for (const [header, value] of Object.entries(buildRateLimitHeaders(result))) {
    response.setHeader(header, value);
  }

  return result;
}

app.use(
  cors({
    origin: resolveCorsOrigins()
  })
);
app.use(express.json({ limit: "8mb" }));

app.use("/api/admin", (_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api/admin", (request, response, next) => {
  if (request.path === "/login") {
    return next();
  }

  const rateLimit = applyRateLimit(request, response, "admin-api", adminApiRateLimit);

  if (!rateLimit.allowed) {
    response.status(429).json({
      error: "Too many admin requests. Please try again later."
    });
    return;
  }

  next();
});

const requireAdminSession = (request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (isAdminSessionValid(request.headers.cookie)) {
    return next();
  }

  response.status(401).json({
    error: "Authentication required."
  });
};

const readSingleQueryValue = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return undefined;
};

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/site-content", async (_request, response, next) => {
  try {
    const content = await readSiteContent();
    response.json(content);
  } catch (error) {
    next(error);
  }
});

app.put(
  "/api/site-content",
  (request, response, next) => {
    const rateLimit = applyRateLimit(request, response, "admin-api", adminApiRateLimit);

    if (!rateLimit.allowed) {
      response.status(429).json({
        error: "Too many admin requests. Please try again later."
      });
      return;
    }

    next();
  },
  requireAdminSession,
  async (request, response, next) => {
    try {
      const validation = validateSiteContent(request.body as Parameters<typeof validateSiteContent>[0]);

      if (!validation.ok) {
        return response.status(400).json({
          error: "Unable to validate the site content."
        });
      }

      const content = await writeSiteContent(validation.data);

      response.json({
        content
      });
    } catch (error) {
      next(error);
    }
  }
);

app.get("/api/admin/session", async (request, response) => {
  const session = getAdminSessionFromCookie(request.headers.cookie);

  response.json({
    authenticated: Boolean(session),
    email: session?.email ?? null
  });
});

app.post("/api/admin/login", async (request, response) => {
  if (!isAdminAuthConfigured()) {
    response.status(503).json({
      error: getAdminAuthConfigurationError()
    });
    return;
  }

  const rateLimit = applyRateLimit(request, response, "admin-login", loginRateLimit);

  if (!rateLimit.allowed) {
    response.status(429).json({
      error: "Too many sign-in attempts. Please try again later."
    });
    return;
  }

  const payload = request.body as { email?: string; password?: string } | null;
  const email = typeof payload?.email === "string" ? payload.email : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (!verifyAdminCredentials(email, password)) {
    response.status(401).json({
      error: "Invalid admin email or password."
    });
    return;
  }

  response.setHeader("Set-Cookie", createAdminSessionCookie());
  response.json({
    authenticated: true,
    email: adminEmailAddress
  });
});

app.post("/api/admin/logout", async (_request, response) => {
  response.setHeader("Set-Cookie", clearAdminSessionCookie());
  response.json({
    authenticated: false
  });
});

app.get("/api/admin/inquiries", requireAdminSession, async (request, response, next) => {
  try {
    const rawLimit = readSingleQueryValue(request.query.limit);
    const limit =
      !rawLimit || rawLimit === "all"
        ? null
        : Number.isFinite(Number(rawLimit))
          ? Math.max(1, Math.min(500, Math.floor(Number(rawLimit))))
          : 10;
    const from = readSingleQueryValue(request.query.from);
    const to = readSingleQueryValue(request.query.to);
    const replyStatuses = (readSingleQueryValue(request.query.statuses) ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter((value): value is "pending" | "complete" => value === "pending" || value === "complete");
    const interests = (readSingleQueryValue(request.query.categories) ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const inquiries = await getInquiries({ limit, from, to, replyStatuses, interests });

    response.json(inquiries);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/inquiries/:id", requireAdminSession, async (request, response, next) => {
  try {
    const id = typeof request.params.id === "string" ? request.params.id.trim() : "";
    const replyStatus = request.body?.replyStatus === "complete" ? "complete" : "";

    if (!id) {
      return response.status(400).json({
        error: "Inquiry id is required."
      });
    }

    if (!replyStatus) {
      return response.status(400).json({
        error: "A valid inquiry status is required."
      });
    }

    const inquiry = await updateInquiryReplyStatus(id, replyStatus);

    if (!inquiry) {
      return response.status(404).json({
        error: "Inquiry not found."
      });
    }

    response.json({
      inquiry,
      message: "Inquiry marked complete."
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/inquiries/:id", requireAdminSession, async (request, response, next) => {
  try {
    const id = typeof request.params.id === "string" ? request.params.id.trim() : "";

    if (!id) {
      return response.status(400).json({
        error: "Inquiry id is required."
      });
    }

    const deleted = await deleteInquiry(id);

    if (!deleted) {
      return response.status(404).json({
        error: "Inquiry not found."
      });
    }

    response.json({
      message: "Inquiry deleted."
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/merchandise/inventory", requireAdminSession, async (_request, response, next) => {
  try {
    const inventory = await readMerchandiseInventory();
    const images = await readMerchandiseImageMap();

    response.json({
      ...inventory,
      inventory: inventory.inventory.map((row) => ({
        ...row,
        imageSrc: images[row.sku] ?? null
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/merchandise/inventory", requireAdminSession, async (request, response) => {
  try {
    const result = await updateMerchandiseInventoryQuantity(request.body);
    const images = await readMerchandiseImageMap();

    response.json({
      ...result,
      inventory: result.inventory.map((row) => ({
        ...row,
        imageSrc: images[row.sku] ?? null
      }))
    });
  } catch (error) {
    if (error instanceof MerchandiseReservationError) {
      return response.status(error.statusCode).json({
        error: error.message,
        ...(error.inventory ? { inventory: error.inventory } : {})
      });
    }

    console.error(error);
    response.status(500).json({
      error: "Unable to update merchandise quantity."
    });
  }
});

app.get("/api/admin/merchandise/images", requireAdminSession, async (_request, response, next) => {
  try {
    response.json({
      images: await readMerchandiseImages()
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/merchandise/images", requireAdminSession, async (request, response, next) => {
  try {
    const image = await uploadMerchandiseImage(request.body);

    response.status(201).json({
      image,
      message: "Merchandise image updated."
    });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Unable to update merchandise image."
    });
  }
});

app.delete("/api/admin/merchandise/images/:sku", requireAdminSession, async (request, response, next) => {
  try {
    const image = await clearMerchandiseImage(request.params.sku);

    response.json({
      image,
      message: "Merchandise image removed."
    });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Unable to remove merchandise image."
    });
  }
});

app.get("/api/admin/merchandise/orders", requireAdminSession, async (_request, response, next) => {
  try {
    response.json(await readMerchandiseOrders());
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/merchandise/orders", requireAdminSession, async (request, response) => {
  try {
    response.json(await cancelMerchandiseReservation(request.body));
  } catch (error) {
    if (error instanceof MerchandiseReservationError) {
      return response.status(error.statusCode).json({
        error: error.message,
        ...(error.inventory ? { inventory: error.inventory } : {})
      });
    }

    console.error(error);
    response.status(500).json({
      error: "Unable to cancel merchandise order."
    });
  }
});

app.post("/api/inquiries", async (request, response, next) => {
  try {
    const rateLimit = applyRateLimit(request, response, "public-inquiry", inquirySubmitRateLimit);

    if (!rateLimit.allowed) {
      return response.status(429).json({
        error: "Too many inquiry submissions. Please try again later."
      });
    }

    const validation = validateInquiryPayload(request.body as InquiryPayload);

    if (!validation.ok) {
      return response.status(400).json({
        error: validation.error
      });
    }

    const result = await createInquiry(validation.data);
    const total = result.total;
    const notification = await sendInquiryNotification(validation.data);

    if (!notification.ok) {
      console.warn(notification.error);
    }

    response.status(201).json({
      message: "Form submitted successfully.",
      total
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/merchandise/inventory", async (_request, response, next) => {
  try {
    const inventory = await readMerchandiseInventory();

    response.setHeader("Cache-Control", "no-store");
    response.json(inventory);
  } catch (error) {
    next(error);
  }
});

app.get("/api/merchandise/health", async (_request, response) => {
  try {
    response.setHeader("Cache-Control", "no-store");
    response.json(await pingMerchandiseDatabase());
  } catch (error) {
    if (error instanceof MerchandiseReservationError) {
      return response.status(error.statusCode).json({
        ok: false,
        error: error.message
      });
    }

    console.error(error);
    response.status(500).json({
      ok: false,
      error: "Unable to check merchandise database."
    });
  }
});

app.get("/api/merchandise/images", async (_request, response, next) => {
  try {
    response.setHeader("Cache-Control", "no-store");
    response.json({
      images: await readMerchandiseImages()
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/merchandise/orders", async (request, response, next) => {
  try {
    const rateLimit = applyRateLimit(request, response, "merchandise-reservation", merchandiseReservationRateLimit);

    if (!rateLimit.allowed) {
      return response.status(429).json({
        error: "Too many merchandise reservations. Please try again later."
      });
    }

    if (isMerchandiseReceiptEmailDeliveryRequired() && !isMerchandiseReceiptEmailConfigured()) {
      return response.status(503).json({
        error: getMerchandiseReceiptEmailConfigurationError()
      });
    }

    const result = await createMerchandiseReservation(request.body as MerchandiseReservationPayload);
    const receiptNotification = await sendMerchandiseReceiptNotification(result);

    if (!receiptNotification.ok) {
      console.warn(receiptNotification.error);
    }

    response.status(201).json({
      message: "Order reserved for event pickup.",
      receiptEmail: {
        sent: receiptNotification.ok
      },
      ...result
    });
  } catch (error) {
    if (error instanceof MerchandiseReservationError) {
      return response.status(error.statusCode).json({
        error: error.message,
        ...(error.inventory ? { inventory: error.inventory } : {})
      });
    }

    next(error);
  }
});

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api/")) {
      return next();
    }

    response.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({
    error: "The server hit an unexpected error."
  });
});

app.listen(port, host, () => {
  console.log(`JAANA server listening on http://${host}:${port}`);
});
