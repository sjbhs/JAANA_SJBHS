import { readJsonBody, requireAdminRequest } from "../_shared.js";
import { readMerchandiseImageMap } from "../../../server/lib/merchandiseImageStore.js";
import {
  MerchandiseReservationError,
  readMerchandiseInventory,
  updateMerchandiseInventoryQuantity
} from "../../../server/lib/merchandiseReservationStore.js";

async function inventoryWithImages(inventory: Awaited<ReturnType<typeof readMerchandiseInventory>>) {
  const images = await readMerchandiseImageMap();

  return {
    ...inventory,
    inventory: inventory.inventory.map((row) => ({
      ...row,
      imageSrc: images[row.sku] ?? null
    }))
  };
}

export async function GET(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-inventory");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const inventory = await readMerchandiseInventory();

    return Response.json(await inventoryWithImages(inventory), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error instanceof MerchandiseReservationError ? error.message : "Unable to load merchandise inventory."
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

export async function PATCH(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-inventory-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const payload = await readJsonBody(request);
    const result = await updateMerchandiseInventoryQuantity(payload ?? {});
    const images = await readMerchandiseImageMap();

    return Response.json(
      {
        ...result,
        inventory: result.inventory.map((row) => ({
          ...row,
          imageSrc: images[row.sku] ?? null
        }))
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error instanceof MerchandiseReservationError ? error.message : "Unable to update merchandise quantity."
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
