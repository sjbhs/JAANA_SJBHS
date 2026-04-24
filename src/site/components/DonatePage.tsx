import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

type DonationInfoId = "endowment" | "grant" | "smallGift";
type DonationRequestKind = "endowment" | "matching";
type RequestTone = "idle" | "success" | "error";

type DonationRequestForm = {
  name: string;
  batch: string;
  email: string;
  phone: string;
  proposedEndowmentName: string;
  proposedEndowmentCause: string;
  employerName: string;
  employerLocation: string;
};

type DonationInfoContent = {
  id: DonationInfoId;
  label: string;
  title: string;
  summary: string;
  sections: {
    title: string;
    items: string[];
  }[];
};

const financeEmail = "jaanafinance@gmail.com";

const donationRoutes = [
  {
    id: "endowment" as const,
    title: "Endowment",
    minimum: "Min: $12,000 over 3 years",
    body: "An invested corpus created with JAANA US. At least 5% is distributed yearly to the donor's chosen cause."
  },
  {
    id: "grant" as const,
    title: "Grant",
    minimum: "Min: $1,000",
    body: "A grant of $1,000 or more to a donor-selected JAANA/OBA cause."
  },
  {
    id: "smallGift" as const,
    title: "Small gifts",
    minimum: "Min: $1",
    body: "Donations of less than $1,000 are used by JAANA and the SJBHS OBA where needed most."
  },
  {
    id: "matching" as const,
    title: "Matching",
    minimum: "Employer matching",
    body: "Check whether your employer can match your donation."
  }
];

const sharedGrantReasons = [
  "Tax deductions: To obtain a US tax deduction, donors need to donate to a 501(c)(3) non-profit. JAANA has established a partnership with Learn For Life Foundation - LFL, a US registered 501(c)(3) public charity established by Thomas Thekkethala, SJBHS '77.",
  "Compliance: Foreign donations to SJBHS, BJES, and the OBA should comply with India's FCRA rules. JAANA works with LFL and BJES to ensure statutory requirements are met.",
  "Employer matching: As a 501(c)(3) organization, LFL is eligible for several employer matching programs. Please check with your employer or reach out with your employer's name to check eligibility.",
  "Low administrative costs: JAANA is entirely volunteer run. Administrative costs are less than $500 annually, helping ensure donations go to recipients."
];

const donationInfoContent: Record<DonationInfoId, DonationInfoContent> = {
  endowment: {
    id: "endowment",
    label: "Endowment",
    title: "Endowment details",
    summary:
      "Endowments can be created by individuals, batches, or corporations, and may be named in honor of someone.",
    sections: [
      {
        title: "How it works",
        items: [
          "The amount donated is held in JAANA's US-based Fidelity account.",
          "Donors may choose from index funds available through Fidelity, or choose other investments in consultation with their tax advisors.",
          "Donors may opt for access to the Fidelity discount.",
          "A minimum of 5% of the endowment account balance, or a higher donor-selected percentage, is distributed annually to the SJBHS OBA via the BJES FCRA account.",
          "Donors may specify the causes supported by their endowment."
        ]
      },
      {
        title: "Why use JAANA?",
        items: [
          "US market access gives donors several investment options.",
          "Long-term USD-to-INR movement can compound annual distributions.",
          ...sharedGrantReasons
        ]
      }
    ]
  },
  grant: {
    id: "grant",
    label: "Grant",
    title: "Grant details",
    summary: "Grants of $1,000 or more can be directed to a donor-selected JAANA/OBA cause.",
    sections: [
      {
        title: "How it works",
        items: [
          "Minimum grant amount is $1,000.",
          "The entire amount donated is transferred to the SJBHS OBA during JAANA's periodic distribution wire transfers to the BJES FCRA account.",
          "Donors may specify the causes supported by their grant.",
          "Donors receive a tax receipt automatically."
        ]
      },
      {
        title: "Why use JAANA?",
        items: sharedGrantReasons
      }
    ]
  },
  smallGift: {
    id: "smallGift",
    label: "Small gifts",
    title: "Small gifts details",
    summary: "Every donation makes an impact for the school, students, and teachers.",
    sections: [
      {
        title: "How it works",
        items: [
          "Small gifts under $1,000 are held in JAANA's US-based Fidelity account.",
          "JAANA, in consultation with the SJBHS OBA, deploys these funds annually based on the programs with the greatest need.",
          "All donations are welcome."
        ]
      },
      {
        title: "Why use JAANA?",
        items: sharedGrantReasons
      }
    ]
  }
};

const requestDialogCopy: Record<
  DonationRequestKind,
  {
    label: string;
    title: string;
    body: string;
    interest: string;
    submitLabel: string;
  }
> = {
  endowment: {
    label: "Endowment",
    title: "Endowment request",
    body: `Send the details below and a JAANA volunteer will follow up. You can also email ${financeEmail}.`,
    interest: "Create a named endowment",
    submitLabel: "Submit endowment request"
  },
  matching: {
    label: "Matching",
    title: "Matching request",
    body: `Send the details below to check whether your employer has a matching gifts program. You can also email ${financeEmail}.`,
    interest: "Corporate matching eligibility",
    submitLabel: "Submit matching request"
  }
};

const emptyDonationRequestForm: DonationRequestForm = {
  name: "",
  batch: "",
  email: "",
  phone: "",
  proposedEndowmentName: "",
  proposedEndowmentCause: "",
  employerName: "",
  employerLocation: ""
};

function formatRequestNotes(kind: DonationRequestKind, form: DonationRequestForm) {
  const fields: [string, string][] = [
    ["Request type", requestDialogCopy[kind].title],
    ["Batch", form.batch],
    ["Phone", form.phone]
  ];

  if (kind === "endowment") {
    fields.push(["Proposed endowment account name", form.proposedEndowmentName]);
    fields.push(["Proposed endowment account cause", form.proposedEndowmentCause]);
  } else {
    fields.push(["Employer name", form.employerName]);
    fields.push(["Employer location", form.employerLocation]);
  }

  return fields
    .map(([label, value]) => [label, value.trim()] as const)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

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
  const [activeInfo, setActiveInfo] = useState<DonationInfoId | null>(null);
  const [activeRequest, setActiveRequest] = useState<DonationRequestKind | null>(null);
  const [requestForm, setRequestForm] = useState<DonationRequestForm>(emptyDonationRequestForm);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestStatusMessage, setRequestStatusMessage] = useState("");
  const [requestStatusTone, setRequestStatusTone] = useState<RequestTone>("idle");

  useEffect(() => {
    if (!activeInfo && !activeRequest) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveInfo(null);
        setActiveRequest(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeInfo, activeRequest]);

  const openRequestDialog = (kind: DonationRequestKind) => {
    setActiveInfo(null);
    setActiveRequest(kind);
    setRequestForm({ ...emptyDonationRequestForm });
    setRequestStatusMessage("");
    setRequestStatusTone("idle");
  };

  const handleRequestFieldChange = <K extends keyof DonationRequestForm>(field: K, value: DonationRequestForm[K]) => {
    setRequestForm((current) => ({ ...current, [field]: value }));
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeRequest) {
      return;
    }

    const requestKind = activeRequest;

    setRequestSubmitting(true);
    setRequestStatusMessage("");
    setRequestStatusTone("idle");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: requestForm.name,
          email: requestForm.email,
          organization: requestForm.batch,
          interest: requestDialogCopy[requestKind].interest,
          notes: formatRequestNotes(requestKind, requestForm)
        })
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong.");
      }

      setRequestForm({ ...emptyDonationRequestForm });
      setRequestStatusTone("success");
      setRequestStatusMessage(payload.message ?? "Thanks. Your request has been sent to JAANA.");
    } catch (error) {
      setRequestStatusTone("error");
      setRequestStatusMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const infoContent = activeInfo ? donationInfoContent[activeInfo] : null;
  const requestContent = activeRequest ? requestDialogCopy[activeRequest] : null;
  const dialogLayer =
    typeof document === "undefined"
      ? null
      : createPortal(
          <>
            {infoContent ? (
              <DonationInfoDialog
                info={infoContent}
                onClose={() => setActiveInfo(null)}
                onOpenRequest={infoContent.id === "endowment" ? () => openRequestDialog("endowment") : undefined}
                onDonateClick={
                  infoContent.id === "grant" || infoContent.id === "smallGift"
                    ? () => {
                        setActiveInfo(null);
                        onDonateClick();
                      }
                    : undefined
                }
              />
            ) : null}

            {activeRequest && requestContent ? (
              <DonationRequestDialog
                kind={activeRequest}
                content={requestContent}
                form={requestForm}
                isSubmitting={requestSubmitting}
                statusMessage={requestStatusMessage}
                statusTone={requestStatusTone}
                onClose={() => setActiveRequest(null)}
                onSubmit={handleRequestSubmit}
                onFieldChange={handleRequestFieldChange}
              />
            ) : null}
          </>,
          document.body
        );

  return (
    <>
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
            <p className="donation-cause-link">
              Learn more about each cause we support: <a href="#causes">JAANA/OBA Causes</a>.
            </p>
          </div>
        </div>

        <section className="give-section donation-routes-section">
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

          <div className="donation-route-list">
            {donationRoutes.map((route) => (
              <article key={route.id} className={`support-card donation-route-card donation-route-card-${route.id}`}>
                <div className="donation-route-card-head">
                  <div>
                    <h3>{route.title}</h3>
                  </div>
                  <span className="donation-minimum">{route.minimum}</span>
                </div>
                <p>{route.body}</p>
                <div className="donation-route-actions">
                  {route.id === "endowment" ? (
                    <>
                      <button className="secondary-button" type="button" onClick={() => setActiveInfo("endowment")}>
                        Learn More
                      </button>
                      <button className="primary-button" type="button" onClick={() => openRequestDialog("endowment")}>
                        Create an Endowment
                      </button>
                    </>
                  ) : null}

                  {route.id === "grant" ? (
                    <>
                      <button className="secondary-button" type="button" onClick={() => setActiveInfo("grant")}>
                        Learn More
                      </button>
                      <PlaceholderDonateButton buttonClassName="primary-button" label="Donate Today" onClick={onDonateClick} />
                    </>
                  ) : null}

                  {route.id === "smallGift" ? (
                    <>
                      <button className="secondary-button" type="button" onClick={() => setActiveInfo("smallGift")}>
                        Learn More
                      </button>
                      <PlaceholderDonateButton buttonClassName="primary-button" label="Donate Today" onClick={onDonateClick} />
                    </>
                  ) : null}

                  {route.id === "matching" ? (
                    <button className="primary-button" type="button" onClick={() => openRequestDialog("matching")}>
                      Check Eligibility
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        {editable ? (
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
                  <h3>Contacts</h3>
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
                      ) : null
                    )}
                  </ul>
                </article>

                <article className="contact-card">
                  <h3>{backendOnline ? "Status" : "Offline"}</h3>
                  <p>
                    {backendOnline
                      ? "Use the form below to start a donation, sponsorship, or alumni coordination conversation."
                      : "The form is visible for review, but the connected service is not currently responding."}
                  </p>
                </article>
              </div>

              <InquiryFormCard
                editable={editable}
                donateCopy={donateCopy}
                form={form}
                isSubmitting={isSubmitting}
                statusMessage={statusMessage}
                statusTone={statusTone}
                onSubmit={onSubmit}
                onFieldChange={onFieldChange}
                onChangeDonateCopy={onChangeDonateCopy}
                inquiryTopics={inquiryTopics}
              />
            </div>
          </section>
        ) : (
          <section className="give-section donation-form-section">
            <InquiryFormCard
              editable={editable}
              donateCopy={donateCopy}
              form={form}
              isSubmitting={isSubmitting}
              statusMessage={statusMessage}
              statusTone={statusTone}
              onSubmit={onSubmit}
              onFieldChange={onFieldChange}
              onChangeDonateCopy={onChangeDonateCopy}
              inquiryTopics={inquiryTopics}
            />
          </section>
        )}

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

      {dialogLayer}
    </>
  );
}

type DonationInfoDialogProps = {
  info: DonationInfoContent;
  onClose: () => void;
  onOpenRequest?: () => void;
  onDonateClick?: () => void;
};

function DonationInfoDialog({ info, onClose, onOpenRequest, onDonateClick }: DonationInfoDialogProps) {
  return (
    <div className="donation-info-dialog" role="dialog" aria-modal="true" aria-labelledby={`donation-info-${info.id}`} onClick={onClose}>
      <div className="donation-info-dialog-shell" onClick={(event) => event.stopPropagation()}>
        <button className="zeffy-dialog-close" type="button" onClick={onClose} aria-label="Close donation details">
          ×
        </button>

        <header className="donation-info-dialog-header">
          <p className="support-note">{info.label}</p>
          <h3 id={`donation-info-${info.id}`}>{info.title}</h3>
          <p>{info.summary}</p>
        </header>

        <div className="donation-info-dialog-body">
          {info.sections.map((section) => (
            <section key={section.title} className="donation-info-section">
              <h4>{section.title}</h4>
              <ul className="detail-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="donation-info-actions">
          {onOpenRequest ? (
            <button className="primary-button" type="button" onClick={onOpenRequest}>
              Create an Endowment
            </button>
          ) : null}
          {onDonateClick ? <PlaceholderDonateButton buttonClassName="primary-button" label="Donate Today" onClick={onDonateClick} /> : null}
          <button className="secondary-button" type="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

type DonationRequestDialogProps = {
  kind: DonationRequestKind;
  content: (typeof requestDialogCopy)[DonationRequestKind];
  form: DonationRequestForm;
  isSubmitting: boolean;
  statusMessage: string;
  statusTone: RequestTone;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof DonationRequestForm>(field: K, value: DonationRequestForm[K]) => void;
};

function DonationRequestDialog({
  kind,
  content,
  form,
  isSubmitting,
  statusMessage,
  statusTone,
  onClose,
  onSubmit,
  onFieldChange
}: DonationRequestDialogProps) {
  return (
    <div
      className="donation-request-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-request-dialog-title"
      onClick={onClose}
    >
      <div className="donation-request-dialog-shell" onClick={(event) => event.stopPropagation()}>
        <header className="zeffy-dialog-header donation-request-dialog-header">
          <button className="zeffy-dialog-close" type="button" onClick={onClose} aria-label="Close request form">
            ×
          </button>
          <p className="support-note">{content.label}</p>
          <h3 id="donation-request-dialog-title">{content.title}</h3>
          <p>{content.body}</p>
        </header>

        <div className="donation-request-body">
          <div className="donation-request-panel">
            <form className="donation-request-form" onSubmit={onSubmit}>
              <section className="request-block">
                <div className="request-section-head">
                  <h4>Contact details</h4>
                  <p>Use the best email and phone number for follow-up.</p>
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
                    <span>Batch</span>
                    <input type="text" value={form.batch} onChange={(event) => onFieldChange("batch", event.target.value)} />
                  </label>

                  <label>
                    <span>Phone</span>
                    <input type="tel" value={form.phone} onChange={(event) => onFieldChange("phone", event.target.value)} />
                  </label>
                </div>
              </section>

              {kind === "matching" ? (
                <section className="request-block">
                  <div className="request-section-head">
                    <h4>Employer details</h4>
                    <p>These fields help us check matching eligibility faster.</p>
                  </div>

                  <div className="form-grid">
                    <label>
                      <span>Employer</span>
                      <input
                        required
                        type="text"
                        value={form.employerName}
                        onChange={(event) => onFieldChange("employerName", event.target.value)}
                      />
                    </label>
                    <label>
                      <span>Location</span>
                      <input
                        type="text"
                        value={form.employerLocation}
                        onChange={(event) => onFieldChange("employerLocation", event.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ) : null}

              {kind === "endowment" ? (
                <section className="request-block">
                  <div className="request-section-head">
                    <h4>Endowment details</h4>
                    <p>Tell us the account name and the cause you want to support.</p>
                  </div>

                  <div className="form-grid">
                    <label>
                      <span>Account name</span>
                      <input
                        type="text"
                        value={form.proposedEndowmentName}
                        onChange={(event) => onFieldChange("proposedEndowmentName", event.target.value)}
                      />
                    </label>
                    <label>
                      <span>Cause</span>
                      <input
                        type="text"
                        value={form.proposedEndowmentCause}
                        onChange={(event) => onFieldChange("proposedEndowmentCause", event.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ) : null}

              <div className="form-footer request-footer">
                <button className="primary-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : content.submitLabel}
                </button>
                {statusMessage ? <p className={`status-note ${statusTone}`}>{statusMessage}</p> : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

type InquiryFormCardProps = {
  editable: boolean;
  donateCopy: DonatePageCopy;
  form: InquiryForm;
  isSubmitting: boolean;
  statusMessage: string;
  statusTone: "idle" | "success" | "error";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof InquiryForm>(field: K, value: InquiryForm[K]) => void;
  onChangeDonateCopy?: <K extends keyof DonatePageCopy>(key: K, value: DonatePageCopy[K]) => void;
  inquiryTopics: string[];
};

function InquiryFormCard({
  editable,
  donateCopy,
  form,
  isSubmitting,
  statusMessage,
  statusTone,
  onSubmit,
  onFieldChange,
  onChangeDonateCopy,
  inquiryTopics
}: InquiryFormCardProps) {
  return (
    <form className={`inquiry-card ${editable ? "" : "inquiry-card--solo"}`} onSubmit={onSubmit}>
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
          <input type="text" value={form.organization} onChange={(event) => onFieldChange("organization", event.target.value)} />
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
  );
}
