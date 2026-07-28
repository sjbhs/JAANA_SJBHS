import nodemailer from "nodemailer";

export type SmtpContext = "inquiry" | "merchandise";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  senderAddress: string;
  user?: string;
  pass?: string;
};

const contextNames: Record<SmtpContext, string> = {
  inquiry: "JAANA Website",
  merchandise: "JAANA Merchandise"
};

export function parseBoolean(value: string | undefined) {
  const normalizedValue = value?.trim().toLowerCase();

  if (["true", "1", "yes"].includes(normalizedValue ?? "")) {
    return true;
  }

  if (["false", "0", "no"].includes(normalizedValue ?? "")) {
    return false;
  }

  return null;
}

function mailboxAddress(value: string) {
  const angleBracketMatch = value.match(/<([^>]+)>/);

  return (angleBracketMatch?.[1] ?? value).trim();
}

function getSmtpConfig(): SmtpConfig | null {
  const gmailUser = process.env.GMAIL_USER?.trim() || "";
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim() || "";
  const host = process.env.SMTP_HOST?.trim() || (gmailUser && gmailAppPassword ? "smtp.gmail.com" : "");
  const rawPort = Number(process.env.SMTP_PORT ?? (host === "smtp.gmail.com" ? 465 : 587));
  const port = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 587;
  const secure = parseBoolean(process.env.SMTP_SECURE) ?? port === 465;
  const user = process.env.SMTP_USER?.trim() || gmailUser;
  const pass = process.env.SMTP_PASS?.trim() || gmailAppPassword;
  const senderAddress = mailboxAddress(process.env.SMTP_FROM?.trim() || user);

  if (!host || !senderAddress) {
    return null;
  }

  if ((user && !pass) || (!user && pass)) {
    return null;
  }

  return {
    host,
    port,
    secure,
    senderAddress,
    ...(user && pass ? { user, pass } : {})
  };
}

export function getSmtpConfigurationError(contextLabel: string) {
  const missingValues = [];
  const gmailUser = process.env.GMAIL_USER?.trim() || "";
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim() || "";
  const hasGmailSmtpAlias = Boolean(gmailUser && gmailAppPassword);

  if (!process.env.SMTP_HOST?.trim() && !hasGmailSmtpAlias) {
    missingValues.push("SMTP_HOST");
  }

  if (!process.env.SMTP_FROM?.trim() && !process.env.SMTP_USER?.trim() && !gmailUser) {
    missingValues.push("SMTP_FROM");
  }

  if (
    (process.env.SMTP_USER?.trim() && !process.env.SMTP_PASS?.trim() && !gmailAppPassword) ||
    (!process.env.SMTP_USER?.trim() && !gmailUser && process.env.SMTP_PASS?.trim())
  ) {
    missingValues.push("SMTP_USER and SMTP_PASS");
  }

  return missingValues.length
    ? `${contextLabel} is not configured. Set ${missingValues.join(", ")}.`
    : `${contextLabel} is not configured.`;
}

export function isSmtpConfigured() {
  return Boolean(getSmtpConfig());
}

export function createSmtpTransport(context: SmtpContext) {
  const config = getSmtpConfig();

  if (!config) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    ...(config.user && config.pass
      ? {
          auth: {
            user: config.user,
            pass: config.pass
          }
        }
      : {})
  });

  return {
    transporter,
    from: `${contextNames[context]} <${config.senderAddress}>`
  };
}
