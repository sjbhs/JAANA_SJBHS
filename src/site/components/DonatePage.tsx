import { FormEvent } from "react";
import { InquiryForm, TabConfig } from "../types";
import { PlaceholderDonateButton } from "./PlaceholderDonateButton";

type DonatePageProps = {
  details: TabConfig;
  backendOnline: boolean;
  contactChannels: { label: string; value: string; href: string }[];
  inquiryTopics: string[];
  form: InquiryForm;
  isSubmitting: boolean;
  statusMessage: string;
  statusTone: "idle" | "success" | "error";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof InquiryForm>(field: K, value: InquiryForm[K]) => void;
};

export function DonatePage({
  details,
  backendOnline,
  contactChannels,
  inquiryTopics,
  form,
  isSubmitting,
  statusMessage,
  statusTone,
  onSubmit,
  onFieldChange
}: DonatePageProps) {
  return (
    <section id="donate-panel" className="subpage-shell donate-shell" role="tabpanel" aria-label="Donate">
      <div className="donation-page-header">
        <div className="donation-page-copy">
          <h2>{details.title}</h2>
          {details.copy ? <p>{details.copy}</p> : null}
        </div>
      </div>

      <section className="give-section">
        <div className="give-section-head">
          <h3>Online giving will be available soon</h3>
          <p>Donation links for the supported causes will be added here as soon as the giving page is ready.</p>
        </div>

        <article className="support-card donation-route-card">
          <p className="support-note">Coming soon</p>
          <h3>Donate online through JAANA</h3>
          <p>
            JAANA is preparing its online giving page. When it is published, this section will include direct donation
            links for the causes listed on the Causes page.
          </p>
          <PlaceholderDonateButton buttonClassName="primary-button" />
        </article>
      </section>

      <section className="give-section">
        <div className="give-section-head">
          <h3>Reach JAANA directly</h3>
          <p>For donation enquiries in the meantime, use the details below.</p>
        </div>

        <div className="contact-panel">
          <div className="contact-sidebar">
            <article className="contact-card">
              <h3>Donation, sponsorship, and alumni contacts</h3>
              <ul className="contact-list">
                {contactChannels.map((channel) => (
                  <li key={channel.label}>
                    <span>{channel.label}</span>
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      {channel.value}
                    </a>
                  </li>
                ))}
              </ul>
            </article>

            <article className="contact-card">
              <h3>{backendOnline ? "Inquiry form ready" : "Inquiry form offline"}</h3>
              <p>
                {backendOnline
                  ? "Use the form to start a donation, sponsorship, or alumni coordination conversation with JAANA."
                  : "The form is visible for review, but the connected service is not currently responding."}
              </p>
            </article>
          </div>

          <form className="inquiry-card" onSubmit={onSubmit}>
            <div className="form-heading">
              <h3>Tell the team how you would like to get involved.</h3>
              <p>
                Use this form for cause support, U.S. donations, sponsorship enquiries, chapter coordination, or
                general alumni questions.
              </p>
            </div>

            <div className="form-grid">
              <label>
                <span>Name</span>
                <input required type="text" value={form.name} onChange={(event) => onFieldChange("name", event.target.value)} />
              </label>

              <label>
                <span>Email</span>
                <input required type="email" value={form.email} onChange={(event) => onFieldChange("email", event.target.value)} />
              </label>

              <label>
                <span>Batch / City / Organization</span>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(event) => onFieldChange("organization", event.target.value)}
                />
              </label>

              <label>
                <span>What is this about?</span>
                <select required value={form.interest} onChange={(event) => onFieldChange("interest", event.target.value)}>
                  <option value="">Select one</option>
                  {inquiryTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full-width">
                <span>Notes</span>
                <textarea
                  rows={4}
                  value={form.notes}
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
        </div>
      </section>
    </section>
  );
}
