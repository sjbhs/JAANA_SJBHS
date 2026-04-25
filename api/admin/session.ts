import { adminEmailAddress, getAdminSessionFromCookie } from "../../server/lib/adminAuth.js";

export async function GET(request: Request) {
  const session = getAdminSessionFromCookie(request.headers.get("cookie"));

  return Response.json(
    {
      authenticated: Boolean(session),
      email: session?.email ?? null,
      adminEmail: adminEmailAddress
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
