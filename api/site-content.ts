import { isAdminSessionValid } from "./admin/_auth.js";
import { readJsonBody, unauthorizedResponse } from "./admin/_shared.js";
import { readSiteContent, validateSiteContent, writeSiteContent } from "../server/lib/siteContentStore.js";

export async function GET() {
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
        status: 500
      }
    );
  }
}

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
