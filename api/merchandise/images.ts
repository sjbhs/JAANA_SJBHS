import { readMerchandiseImages } from "../../server/lib/merchandiseImageStore.js";

export async function GET() {
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
