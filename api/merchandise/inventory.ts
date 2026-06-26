import { readMerchandiseInventory } from "../../server/lib/merchandiseReservationStore.js";

export async function GET() {
  try {
    const inventory = await readMerchandiseInventory();

    return Response.json(inventory, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Unable to load merchandise inventory."
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
