import { requireAdminRequest } from "../_shared.js";
import {
  cancelMerchandiseReservation,
  MerchandiseReservationError,
  readMerchandiseOrders
} from "../../../server/lib/merchandiseReservationStore.js";

export async function GET(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-orders");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    return Response.json(await readMerchandiseOrders(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Unable to load merchandise orders."
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

export async function PATCH(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-order-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    return Response.json(await cancelMerchandiseReservation(await request.json()), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error instanceof MerchandiseReservationError ? error.message : "Unable to cancel merchandise order."
      },
      {
        status: error instanceof MerchandiseReservationError ? error.statusCode : 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
