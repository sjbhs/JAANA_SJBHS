import { createInquiry } from "../../server/lib/inquiryStore.js";
import { isInquiryEmailDeliveryRequired, sendInquiryNotification } from "../../server/lib/inquiryNotifications.js";
import { validateInquiryPayload } from "../../server/lib/inquiryValidation.js";
import type { InquiryPayload } from "../../server/lib/inquiryValidation.js";
import { buildRateLimitHeaders, checkRateLimit, getClientIpFromRequestHeaders } from "../../server/lib/rateLimit.js";

const inquirySubmitRateLimit = { limit: 10, windowMs: 15 * 60 * 1000 };

async function readPayload(request: Request) {
  try {
    return (await request.json()) as InquiryPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
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

  const payload = await readPayload(request);

  if (!payload) {
    return Response.json(
      {
        error: "Enter a valid JSON payload."
      },
      {
        status: 400
      }
    );
  }

  const validation = validateInquiryPayload(payload);

  if (!validation.ok) {
    return Response.json(
      {
        error: validation.error
      },
      {
        status: 400
      }
    );
  }

  try {
    const notification = await sendInquiryNotification(validation.data);

    if (!notification.ok) {
      console.warn(notification.error);

      if (isInquiryEmailDeliveryRequired()) {
        return Response.json(
          {
            error:
              "The inquiry email service is not configured. Please email jaanagroup@gmail.com directly."
          },
          {
            status: 503
          }
        );
      }
    }

    let total: number | null = null;

    try {
      const result = await createInquiry(validation.data);
      total = result.total;
    } catch (error) {
      console.warn(error);
    }

    return Response.json(
      {
        message: notification.ok ? "Thanks. Your inquiry has been sent to JAANA." : "Thanks. Your inquiry has been received by JAANA.",
        total
      },
      {
        status: 201
      }
    );
  } catch {
    return Response.json(
      {
        error: "The server hit an unexpected error."
      },
      {
        status: 500
      }
    );
  }
}
