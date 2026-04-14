import { createInquiry } from "../../server/lib/inquiryStore";
import { InquiryPayload, validateInquiryPayload } from "../../server/lib/inquiryValidation";

async function readPayload(request: Request) {
  try {
    return (await request.json()) as InquiryPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const payload = await readPayload(request);

  if (!payload) {
    return Response.json(
      {
        error: "Enter a valid JSON payload."
      },
      {
        status: 400
      }
    );
  }

  const validation = validateInquiryPayload(payload);

  if (!validation.ok) {
    return Response.json(
      {
        error: validation.error
      },
      {
        status: 400
      }
    );
  }

  try {
    const result = await createInquiry(validation.data);

    return Response.json(
      {
        message: "Thanks. Your inquiry has been sent to JAANA.",
        total: result.total
      },
      {
        status: 201
      }
    );
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
