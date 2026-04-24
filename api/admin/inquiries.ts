import { isAdminSessionValid } from "../../server/lib/adminAuth";
import { getRecentInquiries } from "../../server/lib/inquiryStore";
import { unauthorizedResponse } from "./_shared";

export async function GET(request: Request) {
  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 10);
    const inquiries = await getRecentInquiries(Number.isFinite(limit) ? Math.max(1, Math.min(50, Math.floor(limit))) : 10);

    return Response.json(inquiries);
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
