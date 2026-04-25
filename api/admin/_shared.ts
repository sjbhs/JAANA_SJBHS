import { buildRateLimitHeaders, RateLimitResult } from "../../server/lib/rateLimit";

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
