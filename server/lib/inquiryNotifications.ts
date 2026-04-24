import { NormalizedInquiry } from "./inquiryValidation";

export type InquiryNotificationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

const defaultInquiryRecipient = "jaanafinance@gmail.com";
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const inquiryEmailFrom =
  process.env.INQUIRY_EMAIL_FROM?.trim() || process.env.ADMIN_EMAIL_FROM?.trim() || "JAANA Website <no-reply@jaana.app>";

function parseRecipients(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInquiryText(inquiry: NormalizedInquiry) {
  return [
    "A new inquiry was submitted from the JAANA website.",
    "",
    `Interest: ${inquiry.interest}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Batch / City / Organization: ${inquiry.organization || "Not provided"}`,
    "",
    "Notes:",
    inquiry.notes || "Not provided"
  ].join("\n");
}

function formatInquiryHtml(inquiry: NormalizedInquiry) {
  const rows = [
    ["Interest", inquiry.interest],
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Batch / City / Organization", inquiry.organization || "Not provided"],
    ["Notes", inquiry.notes || "Not provided"]
  ];

  return `
    <div style="font-family: Arial, sans-serif; color: #13244f; line-height: 1.55;">
      <h2 style="margin: 0 0 16px;">New JAANA website inquiry</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <th style="border: 1px solid #d7deea; padding: 10px; text-align: left; vertical-align: top; width: 220px; background: #f6f1e8;">${escapeHtml(label)}</th>
                  <td style="border: 1px solid #d7deea; padding: 10px; white-space: pre-wrap;">${escapeHtml(value)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export async function sendInquiryNotification(inquiry: NormalizedInquiry): Promise<InquiryNotificationResult> {
  if (!resendApiKey) {
    return {
      ok: false,
      error: "Inquiry email is not configured. Set RESEND_API_KEY to enable notifications."
    };
  }

  const to = parseRecipients(process.env.INQUIRY_EMAIL_TO);
  const cc = parseRecipients(process.env.INQUIRY_EMAIL_CC);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: inquiryEmailFrom,
        to: to.length ? to : [defaultInquiryRecipient],
        ...(cc.length ? { cc } : {}),
        subject: `JAANA inquiry: ${inquiry.interest}`,
        text: formatInquiryText(inquiry),
        html: formatInquiryHtml(inquiry)
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");

      return {
        ok: false,
        error: body ? `Unable to send inquiry email: ${body}` : "Unable to send inquiry email."
      };
    }

    return {
      ok: true
    };
  } catch {
    return {
      ok: false,
      error: "Unable to send inquiry email."
    };
  }
}
