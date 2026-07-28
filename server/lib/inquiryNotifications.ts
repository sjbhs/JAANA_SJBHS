import type { NormalizedInquiry } from "./inquiryValidation.js";
import {
  createSmtpTransport,
  getSmtpConfigurationError,
  isSmtpConfigured,
  parseBoolean
} from "./smtpTransport.js";

export type InquiryNotificationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

const defaultGeneralRecipients = ["jaanagroup@gmail.com"];
const defaultFinanceRecipients = ["jaanafinance@gmail.com"];

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

export function getInquiryEmailRecipients() {
  return {
    general: parseRecipients(process.env.INQUIRY_EMAIL_TO_GENERAL),
    finance: parseRecipients(process.env.INQUIRY_EMAIL_TO_FINANCE)
  };
}

function getRecipientsForGroup(group: NormalizedInquiry["recipientGroup"]) {
  const configuredRecipients = getInquiryEmailRecipients();

  if (group === "finance") {
    return configuredRecipients.finance.length ? configuredRecipients.finance : defaultFinanceRecipients;
  }

  return configuredRecipients.general.length ? configuredRecipients.general : defaultGeneralRecipients;
}

export function getInquiryReplyRecipients(inquiry: NormalizedInquiry) {
  return inquiry.email ? [inquiry.email] : [];
}

export function isInquiryEmailDeliveryRequired() {
  const configuredValue = parseBoolean(process.env.REQUIRE_INQUIRY_EMAIL);

  if (configuredValue !== null) {
    return configuredValue;
  }

  return Boolean(process.env.VERCEL);
}

export function getInquiryEmailConfigurationError() {
  return getSmtpConfigurationError("Inquiry email");
}

export function isInquiryEmailConfigured() {
  return isSmtpConfigured();
}

function formatInquiryText(inquiry: NormalizedInquiry) {
  return [
    "A new inquiry was submitted from the JAANA website.",
    "",
    `Interest: ${inquiry.interest}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    ...(inquiry.phone ? [`Phone: ${inquiry.phone}`] : []),
    `Batch / City / Organization: ${inquiry.organization || "Not provided"}`,
    "",
    "Notes:",
    inquiry.notes || "Not provided"
  ].join("\n");
}

function formatInquiryHtml(inquiry: NormalizedInquiry) {
  const name = escapeHtml(inquiry.name);
  const email = escapeHtml(inquiry.email);
  const phone = escapeHtml(inquiry.phone || "Not provided");
  const organization = escapeHtml(inquiry.organization || "Not provided");
  const interest = escapeHtml(inquiry.interest);
  const notes = escapeHtml(inquiry.notes || "Not provided");

  return `
    <div style="margin:0;padding:24px;background:#f3ecdf;font-family:'Avenir Next','Segoe UI',Arial,sans-serif;color:#13213f;">
      <table role="presentation" style="width:100%;border-collapse:collapse;max-width:760px;margin:0 auto;">
        <tbody>
          <tr>
            <td style="padding:0 0 16px;">
              <div style="background:#fffaf2;border:1px solid #d9dfeb;border-radius:24px;padding:24px;box-shadow:0 18px 40px rgba(13,31,74,0.08);">
                <div style="display:inline-block;padding:10px 16px;border-radius:999px;background:#eef1f7;color:#13357f;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
                  JAANA inquiry
                </div>
                <h2 style="margin:16px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.05;color:#0f224e;">
                  New website submission
                </h2>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#5d697f;">
                  Someone submitted the JAANA website inquiry form. The fields below follow the same order as the form.
                </p>

                <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 12px;">
                  <tbody>
                    <tr>
                      <td style="width:50%;padding-right:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Name</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${name}</div>
                        </div>
                      </td>
                      <td style="width:50%;padding-left:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Email</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${email}</div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="width:50%;padding-right:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Batch / City / Organization</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${organization}</div>
                        </div>
                      </td>
                      <td style="width:50%;padding-left:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">What is this about?</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${interest}</div>
                        </div>
                      </td>
                    </tr>
                    ${
                      inquiry.phone
                        ? `
                    <tr>
                      <td colspan="2" style="vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Phone</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${phone}</div>
                        </div>
                      </td>
                    </tr>`
                        : ""
                    }
                    <tr>
                      <td colspan="2" style="vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Notes</div>
                          <div style="font-size:18px;line-height:1.6;color:#13213f;white-space:pre-wrap;">${notes}</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#66738b;">
                  Replying to this email will go to the person who submitted the form.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function formatConfirmationText(inquiry: NormalizedInquiry) {
  return [
    `Hi ${inquiry.name},`,
    "",
    "Your request has been submitted to JAANA.",
    "We have received the details below and will follow up as soon as possible.",
    "",
    `Topic: ${inquiry.interest}`,
    `Email: ${inquiry.email}`,
    ...(inquiry.phone ? [`Phone: ${inquiry.phone}`] : []),
    `Batch / City / Organization: ${inquiry.organization || "Not provided"}`,
    "",
    "Notes:",
    inquiry.notes || "Not provided",
    "",
    "If you need to add anything else, reply to this email."
  ].join("\n");
}

function formatConfirmationHtml(inquiry: NormalizedInquiry) {
  const name = escapeHtml(inquiry.name);
  const email = escapeHtml(inquiry.email);
  const phone = escapeHtml(inquiry.phone || "Not provided");
  const organization = escapeHtml(inquiry.organization || "Not provided");
  const interest = escapeHtml(inquiry.interest);
  const notes = escapeHtml(inquiry.notes || "Not provided");

  return `
    <div style="margin:0;padding:24px;background:#f3ecdf;font-family:'Avenir Next','Segoe UI',Arial,sans-serif;color:#13213f;">
      <table role="presentation" style="width:100%;border-collapse:collapse;max-width:760px;margin:0 auto;">
        <tbody>
          <tr>
            <td style="padding:0 0 16px;">
              <div style="background:#fffaf2;border:1px solid #d9dfeb;border-radius:24px;padding:24px;box-shadow:0 18px 40px rgba(13,31,74,0.08);">
                <div style="display:inline-block;padding:10px 16px;border-radius:999px;background:#eef1f7;color:#13357f;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
                  JAANA confirmation
                </div>
                <h2 style="margin:16px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.05;color:#0f224e;">
                  Your request has been submitted
                </h2>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#5d697f;">
                  Thank you for contacting JAANA. We have received your submission and will get back to you soon.
                </p>

                <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 12px;">
                  <tbody>
                    <tr>
                      <td style="width:50%;padding-right:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Name</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${name}</div>
                        </div>
                      </td>
                      <td style="width:50%;padding-left:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Email</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${email}</div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="width:50%;padding-right:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Batch / City / Organization</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${organization}</div>
                        </div>
                      </td>
                      <td style="width:50%;padding-left:8px;vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">What is this about?</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${interest}</div>
                        </div>
                      </td>
                    </tr>
                    ${
                      inquiry.phone
                        ? `
                    <tr>
                      <td colspan="2" style="vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Phone</div>
                          <div style="font-size:18px;line-height:1.4;color:#13213f;">${phone}</div>
                        </div>
                      </td>
                    </tr>`
                        : ""
                    }
                    <tr>
                      <td colspan="2" style="vertical-align:top;">
                        <div style="border:1px solid #d7deea;border-radius:18px;padding:14px 16px;background:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#66738b;margin-bottom:6px;">Notes</div>
                          <div style="font-size:18px;line-height:1.6;color:#13213f;white-space:pre-wrap;">${notes}</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#66738b;">
                  You can reply to this email if you need to add more information.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export async function sendInquiryNotification(inquiry: NormalizedInquiry): Promise<InquiryNotificationResult> {
  const smtp = createSmtpTransport("inquiry");

  if (!smtp) {
    return {
      ok: false,
      error: getInquiryEmailConfigurationError()
    };
  }

  const to = getRecipientsForGroup(inquiry.recipientGroup);
  const cc = parseRecipients(process.env.INQUIRY_EMAIL_CC);
  const replyTo = getInquiryReplyRecipients(inquiry);

  try {
    const adminNotification = smtp.transporter.sendMail({
      from: smtp.from,
      to,
      ...(cc.length ? { cc } : {}),
      ...(replyTo.length ? { replyTo } : {}),
      subject: `JAANA inquiry: ${inquiry.interest}`,
      text: formatInquiryText(inquiry),
      html: formatInquiryHtml(inquiry)
    });
    const submitterConfirmation = smtp.transporter.sendMail({
      from: smtp.from,
      to: [inquiry.email],
      replyTo: to,
      subject: "JAANA confirmation: your request has been submitted",
      text: formatConfirmationText(inquiry),
      html: formatConfirmationHtml(inquiry)
    });
    const results = await Promise.allSettled([adminNotification, submitterConfirmation]);
    const rejectedResults = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");

    if (rejectedResults.length) {
      return {
        ok: false,
        error: `Unable to send inquiry email: ${rejectedResults
          .map((result) => (result.reason instanceof Error ? result.reason.message : String(result.reason)))
          .join("; ")}`
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
