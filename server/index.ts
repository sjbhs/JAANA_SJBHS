import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
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
