import { FormEvent } from "react";
import { InquiryForm } from "../types";
import { InquiryFormCard } from "./InquiryFormCard";

type ContactPageProps = {
  form: InquiryForm;
  isSubmitting: boolean;
  statusMessage: string;
  statusTone: "idle" | "success" | "error";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof InquiryForm>(field: K, value: InquiryForm[K]) => void;
};

export function ContactPage({
  form,
  isSubmitting,
  statusMessage,
  statusTone,
  onSubmit,
  onFieldChange
}: ContactPageProps) {
  return (
    <section id="contact-panel" className="subpage-shell donate-shell" role="tabpanel" aria-label="Contact Us">
      <section className="give-section contact-form-section">
        <InquiryFormCard form={form} isSubmitting={isSubmitting} statusMessage={statusMessage} statusTone={statusTone} onSubmit={onSubmit} onFieldChange={onFieldChange} />
      </section>
    </section>
  );
}
