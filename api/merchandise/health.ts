import {
  MerchandiseReservationError,
  pingMerchandiseDatabase
} from "../../server/lib/merchandiseReservationStore.js";

export async function GET() {
  try {
    return Response.json(await pingMerchandiseDatabase(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        ok: false,
        error: error instanceof MerchandiseReservationError ? error.message : "Unable to check merchandise database."
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
