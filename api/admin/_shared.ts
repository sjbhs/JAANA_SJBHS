export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return Response.json(
    {
      error: "Authentication required."
    },
    {
      status: 401
    }
  );
}
