import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import {
  adminEmailAddress,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminSessionFromCookie,
  isAdminSessionValid,
  sendAdminPasswordResetEmail,
  verifyAdminCredentials
} from "./lib/adminAuth";
import {
  readConnectContent,
  validateConnectContent,
  writeConnectContent
} from "./lib/connectContentStore";
import { createInquiry, getInquiryStats } from "./lib/inquiryStore";
import { InquiryPayload, validateInquiryPayload } from "./lib/inquiryValidation";

const app = express();
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3001);
const clientDistPath = path.resolve(process.cwd(), "dist/client");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true
  })
);
app.use(express.json());

const requireAdminSession = (request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (isAdminSessionValid(request.headers.cookie)) {
    return next();
  }

  response.status(401).json({
    error: "Authentication required."
  });
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

app.get("/api/admin/session", async (request, response) => {
  const session = getAdminSessionFromCookie(request.headers.cookie);

  response.json({
    authenticated: Boolean(session),
    email: session?.email ?? null
  });
});

app.post("/api/admin/login", async (request, response) => {
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
      message: "Password reminder sent to the admin email."
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

app.get("/api/inquiries/stats", async (_request, response, next) => {
  try {
    const stats = await getInquiryStats();
    response.json(stats);
  } catch (error) {
    next(error);
  }
});

app.post("/api/inquiries", async (request, response, next) => {
  try {
    const validation = validateInquiryPayload(request.body as InquiryPayload);

    if (!validation.ok) {
      return response.status(400).json({
        error: validation.error
      });
    }

    const result = await createInquiry(validation.data);

    response.status(201).json({
      message: "Thanks. Your inquiry has been sent to JAANA.",
      total: result.total
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
