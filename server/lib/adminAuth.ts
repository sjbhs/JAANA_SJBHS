import crypto from "node:crypto";

export type AdminSession = {
  email: string;
  exp: number;
};

export type PasswordResetResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export const adminEmailAddress = process.env.ADMIN_EMAIL?.trim() || "";
export const adminPasswordValue = process.env.ADMIN_PASSWORD?.trim() || "";

const adminSessionSecret = process.env.ADMIN_SESSION_SECRET?.trim() || "";
const adminEmailFrom = process.env.ADMIN_EMAIL_FROM?.trim() || process.env.INQUIRY_EMAIL_FROM?.trim() || "";
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const sessionCookieName = "jaana_admin_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;
const useSecureCookies = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signToken(payload: string) {
  return crypto.createHmac("sha256", adminSessionSecret).update(payload).digest("hex");
}

function safeCompare(actual: string, expected: string) {
  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function createCookieValue(name: string, value: string, maxAgeSeconds: number) {
  const attributes = [`Path=/`, `HttpOnly`, `SameSite=Strict`, `Max-Age=${maxAgeSeconds}`, `Priority=High`];

  if (useSecureCookies) {
    attributes.push("Secure");
  }

  return `${name}=${value}; ${attributes.join("; ")}`;
}

export function getAdminAuthConfigurationError() {
  if (!adminEmailAddress) {
    return "ADMIN_EMAIL is not configured.";
  }

  if (!adminPasswordValue) {
    return "ADMIN_PASSWORD is not configured.";
  }

  if (!adminSessionSecret) {
    return "ADMIN_SESSION_SECRET is not configured.";
  }

  return "";
}

export function isAdminAuthConfigured() {
  return !getAdminAuthConfigurationError();
}

function readCookies(cookieHeader: string | null | undefined) {
  return (cookieHeader ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex < 0) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const rawValue = part.slice(separatorIndex + 1).trim();

      if (!key) {
        return cookies;
      }

      try {
        cookies[key] = decodeURIComponent(rawValue);
      } catch {
        cookies[key] = rawValue;
      }

      return cookies;
    }, {});
}

function createSessionToken(email: string) {
  if (!isAdminAuthConfigured()) {
    throw new Error(getAdminAuthConfigurationError());
  }

  const payload: AdminSession = {
    email: normalizeEmail(email),
    exp: Date.now() + sessionDurationSeconds * 1000
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signToken(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminCredentials(email: string, password: string) {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  return normalizeEmail(email) === normalizeEmail(adminEmailAddress) && safeCompare(password, adminPasswordValue);
}

export function createAdminSessionCookie() {
  return createCookieValue(sessionCookieName, createSessionToken(adminEmailAddress), sessionDurationSeconds);
}

export function clearAdminSessionCookie() {
  return createCookieValue(sessionCookieName, "", 0);
}

export function getAdminSessionFromCookie(cookieHeader: string | null | undefined) {
  if (!isAdminAuthConfigured()) {
    return null;
  }

  const cookies = readCookies(cookieHeader);
  const token = cookies[sessionCookieName];

  if (!token) {
    return null;
  }

  const separatorIndex = token.lastIndexOf(".");

  if (separatorIndex < 0) {
    return null;
  }

  const encodedPayload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = signToken(encodedPayload);

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminSession>;

    if (
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      normalizeEmail(payload.email) !== normalizeEmail(adminEmailAddress) ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    return {
      email: normalizeEmail(payload.email),
      exp: payload.exp
    } satisfies AdminSession;
  } catch {
    return null;
  }
}

export function isAdminSessionValid(cookieHeader: string | null | undefined) {
  return Boolean(getAdminSessionFromCookie(cookieHeader));
}

export async function sendAdminPasswordResetEmail(): Promise<PasswordResetResult> {
  if (!isAdminAuthConfigured()) {
    return {
      ok: false,
      error: getAdminAuthConfigurationError()
    };
  }

  if (!resendApiKey) {
    return {
      ok: false,
      error: "Email sign-in help is not configured. Set RESEND_API_KEY."
    };
  }

  if (!adminEmailFrom) {
    return {
      ok: false,
      error: "Email sign-in help is not configured. Set ADMIN_EMAIL_FROM or INQUIRY_EMAIL_FROM."
    };
  }

  const subject = "JAANA admin sign-in reminder";
  const text = [
    "A sign-in reminder was requested for the JAANA admin panel.",
    "",
    `Login email: ${adminEmailAddress}`,
    "Admin path: /admin",
    "",
    "For security, JAANA does not send passwords by email.",
    "If the password needs to be changed, update ADMIN_PASSWORD in the deployment environment and redeploy.",
    "",
    "Open /admin to sign in."
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: adminEmailFrom,
        to: [adminEmailAddress],
        subject,
        text
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");

      return {
        ok: false,
        error: body ? `Unable to send sign-in reminder: ${body}` : "Unable to send sign-in reminder."
      };
    }

    return {
      ok: true
    };
  } catch {
    return {
      ok: false,
      error: "Unable to send sign-in reminder."
    };
  }
}
