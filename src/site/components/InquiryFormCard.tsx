import { FormEvent } from "react";
import {
  INQUIRY_EMAIL_MAX_LENGTH,
  INQUIRY_NAME_INPUT_PATTERN,
  INQUIRY_NAME_MAX_LENGTH,
  INQUIRY_NOTES_MAX_LENGTH,
  INQUIRY_ORGANIZATION_MAX_LENGTH,
  sanitizeInquiryNameInput
} from "../inquiryConstraints";
import { InquiryForm } from "../types";

type InquiryFormCardProps = {
  form: InquiryForm;
  isSubmitting: boolean;
  statusMessage: string;
  statusTone: "idle" | "success" | "error";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof InquiryForm>(field: K, value: InquiryForm[K]) => void;
};

export function InquiryFormCard({
  form,
  isSubmitting,
  statusMessage,
  statusTone,
  onSubmit,
  onFieldChange
}: InquiryFormCardProps) {
  return (
    <form className="inquiry-card inquiry-card--solo" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          <span>Name</span>
          <input
            required
            type="text"
            value={form.name}
            maxLength={INQUIRY_NAME_MAX_LENGTH}
            pattern={INQUIRY_NAME_INPUT_PATTERN}
            autoComplete="name"
            title="Name may only include letters and spaces."
            onChange={(event) => onFieldChange("name", sanitizeInquiryNameInput(event.target.value))}
          />
        </label>

        <label>
          <span>Email</span>
          <input
            required
            type="email"
            value={form.email}
            maxLength={INQUIRY_EMAIL_MAX_LENGTH}
            autoComplete="email"
            onChange={(event) => onFieldChange("email", event.target.value)}
          />
        </label>

        <label>
          <span>Batch / City / Organization</span>
          <input
            type="text"
            value={form.organization}
            maxLength={INQUIRY_ORGANIZATION_MAX_LENGTH}
            onChange={(event) => onFieldChange("organization", event.target.value)}
          />
        </label>

        <label>
          <span>What is this about?</span>
          <select required value={form.interest} onChange={(event) => onFieldChange("interest", event.target.value)}>
            <option value="">Select one</option>
            <option value="General inquiry">General inquiry</option>
            <option value="Donation question">Donation question</option>
            <option value="Sponsorship inquiry">Sponsorship inquiry</option>
            <option value="Alumni coordination">Alumni coordination</option>
          </select>
        </label>

        <label className="full-width">
          <span>Notes</span>
          <textarea
            rows={4}
            value={form.notes}
            maxLength={INQUIRY_NOTES_MAX_LENGTH}
            placeholder="Share context, timing, the cause you want to support, or any sponsorship requirements."
            onChange={(event) => onFieldChange("notes", event.target.value)}
          />
        </label>
      </div>

      <div className="form-footer">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Submit inquiry"}
        </button>
        {statusMessage ? <p className={`status-note ${statusTone}`}>{statusMessage}</p> : null}
      </div>
    </form>
  );
}
