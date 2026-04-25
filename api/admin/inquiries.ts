import { isAdminSessionValid } from "./_auth.js";
import { getInquiries } from "../../server/lib/inquiryStore.js";
import { unauthorizedResponse } from "./_shared.js";

export async function GET(request: Request) {
  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const limitParam = searchParams.get("limit");
    const parsedLimit =
      limitParam === null || limitParam === "" || limitParam === "all"
        ? null
        : Number.isFinite(Number(limitParam))
          ? Math.max(1, Math.min(500, Math.floor(Number(limitParam))))
          : 10;
    const inquiries = await getInquiries({
      limit: parsedLimit,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined
    });

    return Response.json(inquiries, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "The server hit an unexpected error."
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
