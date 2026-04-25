import {
  INQUIRY_EMAIL_MAX_LENGTH,
  INQUIRY_INTEREST_MAX_LENGTH,
  INQUIRY_NAME_MAX_LENGTH,
  INQUIRY_NOTES_MAX_LENGTH,
  INQUIRY_ORGANIZATION_MAX_LENGTH,
  INQUIRY_PHONE_MAX_LENGTH,
  isValidInquiryName,
  isValidPhoneNumber,
  normalizeSingleLineInput
} from "../../src/site/inquiryConstraints";

export type InquiryPayload = {
  name?: string;
  email?: string;
  organization?: string;
  interest?: string;
  phone?: string;
  notes?: string;
  recipientGroup?: string;
};

export type NormalizedInquiry = {
  name: string;
  email: string;
  organization: string;
  interest: string;
  phone: string;
  notes: string;
  recipientGroup: "general" | "finance";
};

type ValidationResult =
  | {
      ok: true;
      data: NormalizedInquiry;
    }
  | {
      ok: false;
      error: string;
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validRecipientGroups = new Set(["general", "finance"]);

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function validateInquiryPayload(payload: InquiryPayload): ValidationResult {
  const name = normalizeSingleLineInput(readString(payload.name));
  const email = normalizeSingleLineInput(readString(payload.email)).toLowerCase();
  const organization = normalizeSingleLineInput(readString(payload.organization));
  const interest = normalizeSingleLineInput(readString(payload.interest));
  const phone = normalizeSingleLineInput(readString(payload.phone));
  const notes = readString(payload.notes).trim();
  const recipientGroup = normalizeSingleLineInput(readString(payload.recipientGroup)).toLowerCase() || "general";

  if (!name || !email || !interest) {
    return {
      ok: false,
      error: "Name, email, and interest are required."
    };
  }

  if (!isValidInquiryName(name)) {
    return {
      ok: false,
      error: `Name must use letters only and be ${INQUIRY_NAME_MAX_LENGTH} characters or fewer.`
    };
  }

  if (email.length > INQUIRY_EMAIL_MAX_LENGTH || !emailPattern.test(email)) {
    return {
      ok: false,
      error: "Enter a valid email address."
    };
  }

  if (organization.length > INQUIRY_ORGANIZATION_MAX_LENGTH) {
    return {
      ok: false,
      error: `Batch / City / Organization must be ${INQUIRY_ORGANIZATION_MAX_LENGTH} characters or fewer.`
    };
  }

  if (interest.length > INQUIRY_INTEREST_MAX_LENGTH) {
    return {
      ok: false,
      error: `What is this about? must be ${INQUIRY_INTEREST_MAX_LENGTH} characters or fewer.`
    };
  }

  if (phone.length > INQUIRY_PHONE_MAX_LENGTH || !isValidPhoneNumber(phone)) {
    return {
      ok: false,
      error: "Phone numbers may only include a leading + and digits."
    };
  }

  if (notes.length > INQUIRY_NOTES_MAX_LENGTH) {
    return {
      ok: false,
      error: `Notes must be ${INQUIRY_NOTES_MAX_LENGTH} characters or fewer.`
    };
  }

  if (!validRecipientGroups.has(recipientGroup)) {
    return {
      ok: false,
      error: "Invalid inquiry recipient group."
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      organization,
      interest,
      phone,
      notes,
      recipientGroup: recipientGroup as "general" | "finance"
    }
  };
}
