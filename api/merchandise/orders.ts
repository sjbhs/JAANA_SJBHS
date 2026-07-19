import {
  createMerchandiseReservation,
  MerchandiseReservationError,
  type MerchandiseReservationPayload
} from "../../server/lib/merchandiseReservationStore.js";
import {
  getMerchandiseReceiptEmailConfigurationError,
  isMerchandiseReceiptEmailConfigured,
  isMerchandiseReceiptEmailDeliveryRequired,
  sendMerchandiseReceiptNotification
} from "../../server/lib/merchandiseReceiptNotifications.js";
import { buildRateLimitHeaders, checkRateLimit, getClientIpFromRequestHeaders } from "../../server/lib/rateLimit.js";

const merchandiseReservationRateLimit = { limit: 8, windowMs: 15 * 60 * 1000 };

async function readPayload(request: Request) {
  try {
    return (await request.json()) as MerchandiseReservationPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    `merchandise-reservation:${getClientIpFromRequestHeaders(request.headers)}`,
    merchandiseReservationRateLimit
  );

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many merchandise reservations. Please try again later."
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          ...buildRateLimitHeaders(rateLimit)
        }
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
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  try {
    if (isMerchandiseReceiptEmailDeliveryRequired() && !isMerchandiseReceiptEmailConfigured()) {
      return Response.json(
        {
          error: getMerchandiseReceiptEmailConfigurationError()
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const result = await createMerchandiseReservation(payload);
    const receiptNotification = await sendMerchandiseReceiptNotification(result);

    if (!receiptNotification.ok) {
      console.warn(receiptNotification.error);
    }

    return Response.json(
      {
        message: "Order reserved for event pickup.",
        receiptEmail: {
          sent: receiptNotification.ok
        },
        ...result
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    if (error instanceof MerchandiseReservationError) {
      return Response.json(
        {
          error: error.message,
          ...(error.inventory ? { inventory: error.inventory } : {})
        },
        {
          status: error.statusCode,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    console.error(error);

    return Response.json(
      {
        error: "Unable to reserve the selected merchandise."
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
