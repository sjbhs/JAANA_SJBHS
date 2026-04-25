import {
  adminEmailAddress,
  getAdminAuthConfigurationError,
  isAdminAuthConfigured,
  sendAdminPasswordResetEmail
} from "../../server/lib/adminAuth";
import { checkRateLimit, getClientIpFromRequestHeaders } from "../../server/lib/rateLimit";
import { readJsonBody, tooManyRequestsResponse } from "./_shared";

const passwordHelpRateLimit = { limit: 3, windowMs: 30 * 60 * 1000 };

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

  const rateLimit = checkRateLimit(
    `admin-sign-in-help:${getClientIpFromRequestHeaders(request.headers)}`,
    passwordHelpRateLimit
  );

  if (!rateLimit.allowed) {
    return tooManyRequestsResponse(rateLimit, "Too many sign-in reminder requests. Please try again later.");
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

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (email !== adminEmailAddress.toLowerCase()) {
    return Response.json(
      {
        error: "That email address is not configured for the admin account."
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const result = await sendAdminPasswordResetEmail();

  if (!result.ok) {
    return Response.json(
      {
        error: result.error
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  return Response.json(
    {
      message: "Sign-in reminder sent to the admin email."
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
