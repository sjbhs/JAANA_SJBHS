import { requireAdminRequest } from "../_shared.js";
import {
  clearMerchandiseImage,
  readMerchandiseImages,
  uploadMerchandiseImage
} from "../../../server/lib/merchandiseImageStore.js";

export async function GET(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-images");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    return Response.json(
      {
        images: await readMerchandiseImages()
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
        error: "Unable to load merchandise images."
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

export async function POST(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-image-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const image = await uploadMerchandiseImage(await request.json());

    return Response.json(
      {
        image,
        message: "Merchandise image updated."
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to update merchandise image."
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

export async function DELETE(request: Request) {
  const adminGuard = requireAdminRequest(request, "merchandise-image-mutation");

  if (adminGuard) {
    return adminGuard;
  }

  try {
    const url = new URL(request.url);
    const sku = url.searchParams.get("sku") ?? "";
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
