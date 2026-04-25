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
  sendAdminPasswordResetEmail,
  verifyAdminCredentials
} from "./lib/adminAuth";
import {
  readConnectContent,
  validateConnectContent,
  writeConnectContent
} from "./lib/connectContentStore";
import {
  readSiteContent,
  validateSiteContent,
  writeSiteContent
} from "./lib/siteContentStore";
import { createInquiry, getInquiryStats, getInquiries } from "./lib/inquiryStore";
import { isInquiryEmailDeliveryRequired, sendInquiryNotification } from "./lib/inquiryNotifications";
import { InquiryPayload, validateInquiryPayload } from "./lib/inquiryValidation";
import { buildRateLimitHeaders, checkRateLimit, getClientIpFromNodeHeaders } from "./lib/rateLimit";

const app = express();
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3001);
const clientDistPath = path.resolve(process.cwd(), "dist/client");
const devCorsOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"];
const loginRateLimit = { limit: 5, windowMs: 10 * 60 * 1000 };
const passwordHelpRateLimit = { limit: 3, windowMs: 30 * 60 * 1000 };
const inquirySubmitRateLimit = { limit: 10, windowMs: 15 * 60 * 1000 };

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
app.use(express.json({ limit: "32kb" }));

app.use("/api/admin", (_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
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

app.get("/api/connect-content", async (_request, response, next) => {
  try {
    const content = await readConnectContent();
    response.json(content);
  } catch (error) {
    next(error);
  }
});

app.get("/api/site-content", async (_request, response, next) => {
  try {
    const content = await readSiteContent();
    response.json(content);
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/session", async (request, response) => {
  const session = getAdminSessionFromCookie(request.headers.cookie);

  response.json({
    authenticated: Boolean(session),
    email: session?.email ?? null,
    adminEmail: adminEmailAddress
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

app.post("/api/admin/password-reset", async (request, response, next) => {
  try {
    if (!isAdminAuthConfigured()) {
      response.status(503).json({
        error: getAdminAuthConfigurationError()
      });
      return;
    }

    const rateLimit = applyRateLimit(request, response, "admin-sign-in-help", passwordHelpRateLimit);

    if (!rateLimit.allowed) {
      response.status(429).json({
        error: "Too many sign-in reminder requests. Please try again later."
      });
      return;
    }

    const payload = request.body as { email?: string } | null;
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";

    if (email !== adminEmailAddress.toLowerCase()) {
      response.status(400).json({
        error: "That email address is not configured for the admin account."
      });
      return;
    }

    const result = await sendAdminPasswordResetEmail();

    if (!result.ok) {
      response.status(503).json({
        error: result.error
      });
      return;
    }

    response.json({
      message: "Sign-in reminder sent to the admin email."
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/connect-content", requireAdminSession, async (_request, response, next) => {
  try {
    const content = await readConnectContent();
    response.json(content);
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/connect-content", requireAdminSession, async (request, response, next) => {
  try {
    const validation = validateConnectContent(request.body as Parameters<typeof validateConnectContent>[0]);

    if (!validation.ok) {
      return response.status(400).json({
        error: validation.error
      });
    }

    const content = await writeConnectContent(validation.data);

    response.json({
      content
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/site-content", requireAdminSession, async (_request, response, next) => {
  try {
    const content = await readSiteContent();
    response.json(content);
  } catch (error) {
    next(error);
  }
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
    const inquiries = await getInquiries({ limit, from, to });

    response.json(inquiries);
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/site-content", requireAdminSession, async (request, response, next) => {
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
});

app.get("/api/inquiries/stats", requireAdminSession, async (_request, response, next) => {
  try {
    const stats = await getInquiryStats();
    response.json(stats);
  } catch (error) {
    next(error);
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

    const notification = await sendInquiryNotification(validation.data);

    if (!notification.ok) {
      console.warn(notification.error);

      if (isInquiryEmailDeliveryRequired()) {
        return response.status(503).json({
          error: "The inquiry email service is not configured. Please email jaanagroup@gmail.com directly."
        });
      }
    }

    let total: number | null = null;

    try {
      const result = await createInquiry(validation.data);
      total = result.total;
    } catch (error) {
      console.warn(error);
    }

    response.status(201).json({
      message: notification.ok ? "Thanks. Your inquiry has been sent to JAANA." : "Thanks. Your inquiry has been received by JAANA.",
      total
    });
  } catch (error) {
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
