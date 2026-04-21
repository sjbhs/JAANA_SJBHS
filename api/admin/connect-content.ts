import { isAdminSessionValid } from "../../server/lib/adminAuth";
import { unauthorizedResponse, readJsonBody } from "./_shared";
import { readConnectContent, validateConnectContent, writeConnectContent } from "../../server/lib/connectContentStore";

export async function PUT(request: Request) {
  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

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

  const validation = validateConnectContent(payload);

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
    const content = await writeConnectContent(validation.data);

    return Response.json(
      {
        content
      },
      {
        status: 200
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

export async function GET(request: Request) {
  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

  try {
    const content = await readConnectContent();

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
