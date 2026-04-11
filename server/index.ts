import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { createInquiry, getInquiryStats } from "./lib/inquiryStore";

type InquiryPayload = {
  name?: string;
  email?: string;
  organization?: string;
  interest?: string;
  notes?: string;
};

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

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
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
    const payload = request.body as InquiryPayload;
    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const organization = payload.organization?.trim();
    const interest = payload.interest?.trim();
    const notes = payload.notes?.trim() ?? "";

    if (!name || !email || !organization || !interest) {
      return response.status(400).json({
        error: "Name, email, organization, and interest are required."
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return response.status(400).json({
        error: "Enter a valid email address."
      });
    }

    const result = await createInquiry({
      name,
      email,
      organization,
      interest,
      notes
    });

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
