export type InquiryPayload = {
  name?: string;
  email?: string;
  organization?: string;
  interest?: string;
  notes?: string;
};

export type NormalizedInquiry = {
  name: string;
  email: string;
  organization: string;
  interest: string;
  notes: string;
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

export function validateInquiryPayload(payload: InquiryPayload): ValidationResult {
  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const organization = payload.organization?.trim() ?? "";
  const interest = payload.interest?.trim();
  const notes = payload.notes?.trim() ?? "";

  if (!name || !email || !interest) {
    return {
      ok: false,
      error: "Name, email, and interest are required."
    };
  }

  if (!emailPattern.test(email)) {
    return {
      ok: false,
      error: "Enter a valid email address."
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      organization,
      interest,
      notes
    }
  };
}
