import { getAdminSessionFromCookie } from "./_auth.js";

export async function GET(request: Request) {
  const session = getAdminSessionFromCookie(request.headers.get("cookie"));

  return Response.json(
    {
      authenticated: Boolean(session),
      email: session?.email ?? null
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
