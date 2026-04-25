import {
  adminEmailAddress,
  createAdminSessionCookie,
  getAdminAuthConfigurationError,
  isAdminAuthConfigured,
  verifyAdminCredentials
} from "./_auth.js";
import { checkRateLimit, getClientIpFromRequestHeaders } from "../../server/lib/rateLimit.js";
import { readJsonBody, tooManyRequestsResponse } from "./_shared.js";

const loginRateLimit = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return Response.json(
      {
        error: getAdminAuthConfigurationError()
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const rateLimit = checkRateLimit(`admin-login:${getClientIpFromRequestHeaders(request.headers)}`, loginRateLimit);

  if (!rateLimit.allowed) {
    return tooManyRequestsResponse(rateLimit, "Too many sign-in attempts. Please try again later.");
  }

  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return Response.json(
      {
        error: "Enter a valid JSON payload."
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!verifyAdminCredentials(email, password)) {
    return Response.json(
      {
        error: "Invalid admin email or password."
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
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
