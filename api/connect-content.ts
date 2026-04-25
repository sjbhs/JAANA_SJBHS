import { readConnectContent } from "../server/lib/connectContentStore.js";

export async function GET() {
  try {
    const content = await readConnectContent();
    return Response.json(content, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
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
