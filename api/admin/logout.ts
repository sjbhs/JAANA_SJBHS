import { clearAdminSessionCookie } from "../../server/lib/adminAuth.js";

export async function POST() {
  return Response.json(
    {
      authenticated: false
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": clearAdminSessionCookie()
      }
    }
  );
}
