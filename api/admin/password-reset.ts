import { adminEmailAddress, sendAdminPasswordResetEmail } from "../../server/lib/adminAuth";
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

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (email !== adminEmailAddress.toLowerCase()) {
    return Response.json(
      {
        error: "That email address is not configured for the admin account."
      },
      {
        status: 400
      }
    );
  }

  const result = await sendAdminPasswordResetEmail();

  if (!result.ok) {
    return Response.json(
      {
        error: result.error
      },
      {
        status: 503
      }
    );
  }

  return Response.json({
    message: "Password reminder sent to the admin email."
  });
}
