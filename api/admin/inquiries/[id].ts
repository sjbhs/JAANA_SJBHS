import { isAdminSessionValid } from "../_auth.js";
import { readJsonBody, unauthorizedResponse } from "../_shared.js";
import { deleteInquiry, updateInquiryReplyStatus } from "../../../server/lib/inquiryStore.js";

type InquiryActionPayload = {
  replyStatus?: string;
};

function getInquiryIdFromRequest(request: Request) {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);

  return segments[segments.length - 1] ?? "";
}

export async function PATCH(request: Request) {
  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

  const id = getInquiryIdFromRequest(request);
  const payload = (await readJsonBody(request)) as InquiryActionPayload | null;
  const replyStatus = payload?.replyStatus === "complete" ? "complete" : "";

  if (!id) {
    return Response.json({ error: "Inquiry id is required." }, { status: 400 });
  }

  if (!replyStatus) {
    return Response.json({ error: "A valid inquiry status is required." }, { status: 400 });
  }

  try {
    const inquiry = await updateInquiryReplyStatus(id, replyStatus);

    if (!inquiry) {
      return Response.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return Response.json(
      { inquiry, message: "Inquiry marked complete." },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "The server hit an unexpected error." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

  const id = getInquiryIdFromRequest(request);

  if (!id) {
    return Response.json({ error: "Inquiry id is required." }, { status: 400 });
  }

  try {
    const deleted = await deleteInquiry(id);

    if (!deleted) {
      return Response.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return Response.json(
      { message: "Inquiry deleted." },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "The server hit an unexpected error." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
