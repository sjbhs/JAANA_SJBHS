import { readSiteContent } from "../server/lib/siteContentStore";

export async function GET() {
  try {
    const content = await readSiteContent();
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
