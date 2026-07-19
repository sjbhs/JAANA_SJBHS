import { requireAdminRequest } from "../../_shared.js";
import { clearMerchandiseImage } from "../../../../server/lib/merchandiseImageStore.js";

export async function DELETE(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-image-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const url = new URL(request.url);
    const sku = decodeURIComponent(url.pathname.split("/").pop() ?? "");
    const image = await clearMerchandiseImage(sku);

    return Response.json(
      {
        image,
        message: "Merchandise image removed."
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
        error: error instanceof Error ? error.message : "Unable to remove merchandise image."
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
