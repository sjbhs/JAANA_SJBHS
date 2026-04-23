import { FormEvent } from "react";
import { DonatePageCopy, InquiryForm, TabConfig } from "../types";
import { PlaceholderDonateButton } from "./PlaceholderDonateButton";
import { InlineEditableText } from "./InlineEditableText";

type DonatePageProps = {
  details: TabConfig;
  backendOnline: boolean;
  contactChannels: { label: string; value: string; href: string }[];
  inquiryTopics: string[];
  donateCopy: DonatePageCopy;
  editable?: boolean;
  form: InquiryForm;
  isSubmitting: boolean;
  statusMessage: string;
  statusTone: "idle" | "success" | "error";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof InquiryForm>(field: K, value: InquiryForm[K]) => void;
  onDonateClick: () => void;
  onChangeDetails?: <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => void;
  onChangeDonateCopy?: <K extends keyof DonatePageCopy>(key: K, value: DonatePageCopy[K]) => void;
  onChangeContactChannel?: (index: number, key: "label" | "value" | "href", value: string) => void;
  onChangeInquiryTopics?: (topics: string[]) => void;
};

export function DonatePage({
  details,
  backendOnline,
  contactChannels,
  inquiryTopics,
  donateCopy,
  editable = false,
  form,
  isSubmitting,
  statusMessage,
  statusTone,
  onSubmit,
  onFieldChange,
  onDonateClick,
  onChangeDetails,
  onChangeDonateCopy,
  onChangeContactChannel,
  onChangeInquiryTopics
}: DonatePageProps) {
  return (
    <section id="donate-panel" className="subpage-shell donate-shell" role="tabpanel" aria-label="Donate">
      <div className="donation-page-header">
        <div className="donation-page-copy">
          <h2>
            <InlineEditableText
              editable={editable}
              value={details.title}
              onChange={(value) => onChangeDetails?.("title", value)}
              className="section-title-edit"
            />
          </h2>
          {details.copy ? (
            <div className="body-copy">
              <InlineEditableText
                editable={editable}
                value={details.copy}
                onChange={(value) => onChangeDetails?.("copy", value)}
                multiline
                className="body-copy-edit"
              />
            </div>
          ) : null}
        </div>
      </div>

      <section className="give-section">
        <div className="give-section-head">
          <h3>
            <InlineEditableText
              editable={editable}
              value={donateCopy.onlineGivingHeading}
              onChange={(value) => onChangeDonateCopy?.("onlineGivingHeading", value)}
              className="section-title-edit"
            />
          </h3>
          <div className="body-copy">
            <InlineEditableText
              editable={editable}
              value={donateCopy.onlineGivingBody}
              onChange={(value) => onChangeDonateCopy?.("onlineGivingBody", value)}
              multiline
              className="body-copy-edit"
            />
          </div>
        </div>

        <article className="support-card donation-route-card">
          <p className="support-note">Donate online through JAANA</p>
          <h3>Open the Zeffy donation form</h3>
          <p>
            Use the embedded Zeffy campaign to donate without leaving the site. The form opens in a pop-up so donors
            can complete the process directly from JAANA.
          </p>
          <PlaceholderDonateButton buttonClassName="primary-button" onClick={onDonateClick} />
        </article>
      </section>

      <section className="give-section">
        <div className="give-section-head">
          <h3>
            <InlineEditableText
              editable={editable}
              value={donateCopy.contactHeading}
              onChange={(value) => onChangeDonateCopy?.("contactHeading", value)}
              className="section-title-edit"
            />
          </h3>
          <div className="body-copy">
            <InlineEditableText
              editable={editable}
              value={donateCopy.contactBody}
              onChange={(value) => onChangeDonateCopy?.("contactBody", value)}
              multiline
              className="body-copy-edit"
            />
          </div>
        </div>

        <div className="contact-panel">
          <div className="contact-sidebar">
            <article className="contact-card">
              <h3>Donation, sponsorship, and alumni contacts</h3>
              <ul className="contact-list">
                {contactChannels.map((channel, index) =>
                  editable ? (
                    <li key={channel.label}>
                      <input
                        className="connect-edit-input contact-label-edit"
                        value={channel.label}
                        onChange={(event) => onChangeContactChannel?.(index, "label", event.target.value)}
                      />
                      <input
                        className="connect-edit-input contact-value-edit"
                        value={channel.value}
                        onChange={(event) => onChangeContactChannel?.(index, "value", event.target.value)}
                      />
                      <input
                        className="connect-edit-input contact-href-edit"
                        value={channel.href}
                        onChange={(event) => onChangeContactChannel?.(index, "href", event.target.value)}
                      />
                    </li>
                  ) : (
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
                  )
                )}
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
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={donateCopy.formHeading}
                  onChange={(value) => onChangeDonateCopy?.("formHeading", value)}
                  className="section-title-edit"
                />
              </h3>
              <div className="body-copy">
                <InlineEditableText
                  editable={editable}
                  value={donateCopy.formBody}
                  onChange={(value) => onChangeDonateCopy?.("formBody", value)}
                  multiline
                  className="body-copy-edit"
                />
              </div>
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

      {editable && onChangeInquiryTopics ? (
        <section className="give-section admin-inline-section">
          <div className="give-section-head">
            <h3>Inquiry topics</h3>
            <p>Edit the dropdown choices one per line.</p>
          </div>
          <textarea
            className="connect-edit-textarea"
            value={inquiryTopics.join("\n")}
            onChange={(event) =>
              onChangeInquiryTopics(
                event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean)
              )
            }
          />
        </section>
      ) : null}
    </section>
  );
}
