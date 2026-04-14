import { getInquiryStats } from "../../server/lib/inquiryStore";

export async function GET() {
  try {
    const stats = await getInquiryStats();
    return Response.json(stats);
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
