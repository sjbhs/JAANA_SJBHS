import { isAdminSessionValid } from "../../server/lib/adminAuth.js";
import { unauthorizedResponse, readJsonBody } from "./_shared.js";
import { readSiteContent, validateSiteContent, writeSiteContent } from "../../server/lib/siteContentStore.js";

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
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const validation = validateSiteContent(payload);

  if (!validation.ok) {
    return Response.json(
      {
        error: "Unable to validate the site content."
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  try {
    const content = await writeSiteContent(validation.data);

    return Response.json(
      {
        content
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch {
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

export async function GET(request: Request) {
  if (!isAdminSessionValid(request.headers.get("cookie"))) {
    return unauthorizedResponse();
  }

  try {
    const content = await readSiteContent();
    return Response.json(content, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch {
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
