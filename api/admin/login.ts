import { adminEmailAddress, createAdminSessionCookie, verifyAdminCredentials } from "../../server/lib/adminAuth";
import { readJsonBody } from "./_shared";

export async function POST(request: Request) {
  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return Response.json(
      {
        error: "Enter a valid JSON payload."
      },
      {
        status: 400
      }
    );
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!verifyAdminCredentials(email, password)) {
    return Response.json(
      {
        error: "Invalid admin email or password."
      },
      {
        status: 401
      }
    );
  }

  return Response.json(
    {
      authenticated: true,
      email: adminEmailAddress
    },
    {
      headers: {
        "Set-Cookie": createAdminSessionCookie()
      }
    }
  );
}
