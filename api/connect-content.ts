import { readConnectContent } from "../server/lib/connectContentStore";

export async function GET() {
  try {
    const content = await readConnectContent();
    return Response.json(content);
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
