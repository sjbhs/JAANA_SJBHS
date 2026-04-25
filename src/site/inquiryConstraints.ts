export const INQUIRY_NAME_MAX_LENGTH = 50;
export const INQUIRY_EMAIL_MAX_LENGTH = 254;
export const INQUIRY_ORGANIZATION_MAX_LENGTH = 120;
export const INQUIRY_INTEREST_MAX_LENGTH = 100;
export const INQUIRY_PHONE_MAX_LENGTH = 20;
export const INQUIRY_NOTES_MAX_LENGTH = 5000;

export const DONATION_REQUEST_BATCH_MAX_LENGTH = 120;
export const DONATION_REQUEST_EMPLOYER_MAX_LENGTH = 120;
export const DONATION_REQUEST_LOCATION_MAX_LENGTH = 120;
export const DONATION_REQUEST_ACCOUNT_NAME_MAX_LENGTH = 120;
export const DONATION_REQUEST_CAUSE_MAX_LENGTH = 120;

export const INQUIRY_NAME_PATTERN = /^[A-Za-z ]+$/;
export const INQUIRY_NAME_INPUT_PATTERN = "[A-Za-z ]+";
export const INQUIRY_PHONE_PATTERN = /^\+?[0-9]{7,19}$/;
export const INQUIRY_PHONE_INPUT_PATTERN = "\\+?[0-9]{7,19}";

export function normalizeSingleLineInput(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function sanitizeInquiryNameInput(value: string) {
  return value.replace(/[^A-Za-z ]+/g, "").replace(/\s{2,}/g, " ").slice(0, INQUIRY_NAME_MAX_LENGTH);
}

export function sanitizePhoneNumberInput(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "");
  const digits = cleaned.replace(/\+/g, "");
  const hasLeadingPlus = cleaned.startsWith("+");

  return `${hasLeadingPlus ? "+" : ""}${digits}`.slice(0, INQUIRY_PHONE_MAX_LENGTH);
}

export function isValidInquiryName(value: string) {
  const normalized = normalizeSingleLineInput(value);

  return (
    normalized.length > 0 &&
    normalized.length <= INQUIRY_NAME_MAX_LENGTH &&
    INQUIRY_NAME_PATTERN.test(normalized)
  );
}

export function isValidPhoneNumber(value: string) {
  const normalized = normalizeSingleLineInput(value);

  if (!normalized) {
    return true;
  }

  return (
    normalized.length <= INQUIRY_PHONE_MAX_LENGTH &&
    INQUIRY_PHONE_PATTERN.test(normalized)
  );
}
