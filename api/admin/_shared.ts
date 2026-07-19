import { buildRateLimitHeaders, checkRateLimit, getClientIpFromRequestHeaders } from "../../server/lib/rateLimit.js";
import type { RateLimitResult } from "../../server/lib/rateLimit.js";
import { isAdminSessionValid } from "./_auth.js";

const adminApiRateLimit = { limit: 120, windowMs: 15 * 60 * 1000 };

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return Response.json(
    {
      error: "Authentication required."
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export function tooManyRequestsResponse(result: RateLimitResult, error: string) {
  return Response.json(
    {
      error
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        ...buildRateLimitHeaders(result)
      }
    }
  );
}

export function requireAdminRequest(request: Request, scope: string) {
  const rateLimit = checkRateLimit(
    `admin-api:${scope}:${getClientIpFromRequestHeaders(request.headers)}`,
    adminApiRateLimit
  );

  if (!rateLimit.allowed) {
    return tooManyRequestsResponse(rateLimit, "Too many admin requests. Please try again later.");
  }

  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

  return null;
}
