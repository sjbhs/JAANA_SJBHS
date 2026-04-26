import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DONATION_REQUEST_ACCOUNT_NAME_MAX_LENGTH,
  DONATION_REQUEST_BATCH_MAX_LENGTH,
  DONATION_REQUEST_CAUSE_MAX_LENGTH,
  DONATION_REQUEST_EMPLOYER_MAX_LENGTH,
  DONATION_REQUEST_LOCATION_MAX_LENGTH,
  INQUIRY_EMAIL_MAX_LENGTH,
  INQUIRY_NAME_INPUT_PATTERN,
  INQUIRY_NAME_MAX_LENGTH,
  INQUIRY_PHONE_INPUT_PATTERN,
  INQUIRY_PHONE_MAX_LENGTH,
  isValidInquiryName,
  isValidPhoneNumber,
  sanitizeInquiryNameInput,
  sanitizePhoneNumberInput
} from "../inquiryConstraints";
import { DonatePageCopy, DonationInfoContent, DonationInfoId, DonationRoute, DonationRouteAction, TabConfig } from "../types";
import { PlaceholderDonateButton } from "./PlaceholderDonateButton";
import { InlineEditableText } from "./InlineEditableText";

type DonatePageProps = {
  details: TabConfig;
  donateCopy: DonatePageCopy;
  donationRoutes: DonationRoute[];
  donationInfo: DonationInfoContent[];
  editable?: boolean;
  onDonateClick: () => void;
  onChangeDetails?: <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => void;
  onChangeDonateCopy?: <K extends keyof DonatePageCopy>(key: K, value: DonatePageCopy[K]) => void;
  onChangeDonationRoute?: (
    index: number,
    key: "title" | "minimum" | "body" | "action" | "customActionLabel",
    value: string
  ) => void;
  onDeleteDonationRoute?: (index: number) => void;
  donationRouteFormOpen?: boolean;
  newDonationRouteTitle?: string;
  newDonationRouteAction?: DonationRouteAction;
  newDonationRouteCustomLabel?: string;
  onToggleDonationRouteForm?: () => void;
  onChangeNewDonationRouteTitle?: (value: string) => void;
  onChangeNewDonationRouteAction?: (value: DonationRouteAction) => void;
  onChangeNewDonationRouteCustomLabel?: (value: string) => void;
  onAddDonationRoute?: () => void;
  onCancelDonationRoute?: () => void;
  onChangeDonationInfo?: (id: DonationInfoId, key: "label" | "title" | "summary", value: string) => void;
  onChangeDonationInfoSection?: (id: DonationInfoId, sectionIndex: number, value: string) => void;
  onChangeDonationInfoItem?: (id: DonationInfoId, sectionIndex: number, itemIndex: number, value: string) => void;
  onAddDonationInfoSection?: (id: DonationInfoId) => void;
  onDeleteDonationInfoSection?: (id: DonationInfoId, sectionIndex: number) => void;
  onAddDonationInfoItem?: (id: DonationInfoId, sectionIndex: number) => void;
  onDeleteDonationInfoItem?: (id: DonationInfoId, sectionIndex: number, itemIndex: number) => void;
};

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

const financeEmail = "jaanafinance@gmail.com";
const defaultCustomDonationRouteLabel = "Donate Today";

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
    ["Batch", form.batch]
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

function getCustomDonationRouteLabel(route: DonationRoute) {
  return route.customActionLabel?.trim() || defaultCustomDonationRouteLabel;
}

export function DonatePage({
  details,
  donateCopy,
  donationRoutes,
  donationInfo,
  editable = false,
  onDonateClick,
  onChangeDetails,
  onChangeDonateCopy,
  onChangeDonationRoute,
  onDeleteDonationRoute,
  donationRouteFormOpen = false,
  newDonationRouteTitle = "",
  newDonationRouteAction = "smallGift",
  newDonationRouteCustomLabel = defaultCustomDonationRouteLabel,
  onToggleDonationRouteForm,
  onChangeNewDonationRouteTitle,
  onChangeNewDonationRouteAction,
  onChangeNewDonationRouteCustomLabel,
  onAddDonationRoute,
  onCancelDonationRoute,
  onChangeDonationInfo,
  onChangeDonationInfoSection,
  onChangeDonationInfoItem,
  onAddDonationInfoSection,
  onDeleteDonationInfoSection,
  onAddDonationInfoItem,
  onDeleteDonationInfoItem
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
    const normalizedName = requestForm.name.trim();
    const normalizedPhone = requestForm.phone.trim();

    if (!isValidInquiryName(normalizedName)) {
      setRequestStatusTone("error");
      setRequestStatusMessage(`Name must use letters only and be ${INQUIRY_NAME_MAX_LENGTH} characters or fewer.`);
      return;
    }

    if (!isValidPhoneNumber(normalizedPhone)) {
      setRequestStatusTone("error");
      setRequestStatusMessage("Phone numbers may only include a leading + and digits.");
      return;
    }

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
          name: normalizedName,
          email: requestForm.email,
          organization: requestForm.batch,
          interest: requestDialogCopy[requestKind].interest,
          phone: normalizedPhone,
          recipientGroup: "finance",
          notes: formatRequestNotes(requestKind, requestForm)
        })
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong.");
      }

      setRequestForm({ ...emptyDonationRequestForm });
      setRequestStatusTone("success");
      setRequestStatusMessage(payload.message ?? "Form submitted successfully.");
    } catch (error) {
      setRequestStatusTone("error");
      setRequestStatusMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const infoContent = activeInfo ? donationInfo.find((info) => info.id === activeInfo) ?? null : null;
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
                editable={editable}
                onChangeInfo={onChangeDonationInfo}
                onChangeSection={onChangeDonationInfoSection}
                onChangeItem={onChangeDonationInfoItem}
                onAddSection={onAddDonationInfoSection}
                onDeleteSection={onDeleteDonationInfoSection}
                onAddItem={onAddDonationInfoItem}
                onDeleteItem={onDeleteDonationInfoItem}
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
          </div>

          <div className="donation-route-list">
            {donationRoutes.map((route, index) => (
              <article key={route.id} className={`support-card donation-route-card donation-route-card-${route.action}`}>
                <div className="donation-route-card-head">
                  <div>
                    <h3>
                      <InlineEditableText
                        editable={editable}
                        value={route.title}
                        onChange={(value) => onChangeDonationRoute?.(index, "title", value)}
                        className="section-title-edit"
                      />
                    </h3>
                  </div>
                  <span className="donation-minimum">
                    <InlineEditableText
                      editable={editable}
                      value={route.minimum}
                      onChange={(value) => onChangeDonationRoute?.(index, "minimum", value)}
                    />
                  </span>
                </div>
                <div className="donation-route-body">
                  <InlineEditableText
                    editable={editable}
                    value={route.body}
                    onChange={(value) => onChangeDonationRoute?.(index, "body", value)}
                    multiline
                    richText
                  />
                </div>
                <div className="donation-route-actions">
                  {route.action === "endowment" ? (
                    <>
                      <button className="secondary-button" type="button" onClick={() => setActiveInfo("endowment")}>
                        Learn More
                      </button>
                      <button className="primary-button" type="button" onClick={() => openRequestDialog("endowment")}>
                        Create an Endowment
                      </button>
                    </>
                  ) : null}

                  {route.action === "grant" ? (
                    <>
                      <button className="secondary-button" type="button" onClick={() => setActiveInfo("grant")}>
                        Learn More
                      </button>
                      <PlaceholderDonateButton buttonClassName="primary-button" label="Donate Today" onClick={onDonateClick} />
                    </>
                  ) : null}

                  {route.action === "smallGift" ? (
                    <>
                      <button className="secondary-button" type="button" onClick={() => setActiveInfo("smallGift")}>
                        Learn More
                      </button>
                      <PlaceholderDonateButton buttonClassName="primary-button" label="Donate Today" onClick={onDonateClick} />
                    </>
                  ) : null}

                  {route.action === "matching" ? (
                    <button className="primary-button" type="button" onClick={() => openRequestDialog("matching")}>
                      Check Eligibility
                    </button>
                  ) : null}
                </div>

                {editable ? (
                  <div className="donation-route-admin-controls">
                    <label className="donation-route-action-picker">
                      <span>Button behavior</span>
                      <select
                        className="connect-edit-input"
                        value={route.action}
                        onChange={(event) => onChangeDonationRoute?.(index, "action", event.target.value)}
                      >
                        <option value="endowment">Endowment request</option>
                        <option value="grant">Grant donation</option>
                        <option value="smallGift">Small gift donation</option>
                        <option value="matching">Employer matching</option>
                      </select>
                    </label>
                    <button className="admin-danger-button" type="button" onClick={() => onDeleteDonationRoute?.(index)}>
                      Delete route
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
            {onToggleDonationRouteForm ? (
              donationRouteFormOpen ? (
                <article className="support-card donation-route-card donation-route-create-card">
                  <div className="donation-route-create-head">
                    <span className="section-kicker">New route</span>
                    <h3>Add donation route</h3>
                    <p>Create a new public donation card, then switch to edit mode to refine the copy.</p>
                  </div>
                  <div className="donation-route-create-form">
                    <label>
                      <span>Route title</span>
                      <input
                        className="connect-edit-input"
                        value={newDonationRouteTitle}
                        onChange={(event) => onChangeNewDonationRouteTitle?.(event.target.value)}
                        autoFocus
                      />
                    </label>
                    <label>
                      <span>Button behavior</span>
                      <select
                        className="connect-edit-input"
                        value={newDonationRouteAction}
                        onChange={(event) => onChangeNewDonationRouteAction?.(event.target.value as DonationRouteAction)}
                      >
                        <option value="endowment">Endowment request</option>
                        <option value="grant">Grant donation</option>
                        <option value="smallGift">Small gift donation</option>
                        <option value="matching">Employer matching</option>
                      </select>
                    </label>
                  </div>
                  <div className="donation-route-create-actions">
                    <button className="primary-button" type="button" onClick={onAddDonationRoute}>
                      Create route
                    </button>
                    <button className="secondary-button" type="button" onClick={onCancelDonationRoute}>
                      Cancel
                    </button>
                  </div>
                </article>
              ) : (
                <button className="support-card donation-route-add-card" type="button" onClick={onToggleDonationRouteForm}>
                  <span className="donation-route-add-icon" aria-hidden="true">
                    +
                  </span>
                  <span className="donation-route-add-copy">
                    <strong>Add donation route</strong>
                    <small>Create another donation card in this section.</small>
                  </span>
                </button>
              )
            ) : null}
          </div>
        </section>
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
  editable?: boolean;
  onChangeInfo?: (id: DonationInfoId, key: "label" | "title" | "summary", value: string) => void;
  onChangeSection?: (id: DonationInfoId, sectionIndex: number, value: string) => void;
  onChangeItem?: (id: DonationInfoId, sectionIndex: number, itemIndex: number, value: string) => void;
  onAddSection?: (id: DonationInfoId) => void;
  onDeleteSection?: (id: DonationInfoId, sectionIndex: number) => void;
  onAddItem?: (id: DonationInfoId, sectionIndex: number) => void;
  onDeleteItem?: (id: DonationInfoId, sectionIndex: number, itemIndex: number) => void;
};

function DonationInfoDialog({
  info,
  onClose,
  onOpenRequest,
  onDonateClick,
  editable = false,
  onChangeInfo,
  onChangeSection,
  onChangeItem,
  onAddSection,
  onDeleteSection,
  onAddItem,
  onDeleteItem
}: DonationInfoDialogProps) {
  return (
    <div className="donation-info-dialog" role="dialog" aria-modal="true" aria-labelledby={`donation-info-${info.id}`} onClick={onClose}>
      <div className="donation-info-dialog-shell" onClick={(event) => event.stopPropagation()} tabIndex={-1} autoFocus>
        <button className="zeffy-dialog-close" type="button" onClick={onClose} aria-label="Close donation details">
          ×
        </button>

        <header className="donation-info-dialog-header">
          <p className="support-note">
            <InlineEditableText
              editable={editable}
              value={info.label}
              onChange={(value) => onChangeInfo?.(info.id, "label", value)}
            />
          </p>
          <h3 id={`donation-info-${info.id}`}>
            <InlineEditableText
              editable={editable}
              value={info.title}
              onChange={(value) => onChangeInfo?.(info.id, "title", value)}
              className="section-title-edit"
            />
          </h3>
          <div className="body-copy">
            <InlineEditableText
              editable={editable}
              value={info.summary}
              onChange={(value) => onChangeInfo?.(info.id, "summary", value)}
              multiline
              richText
              className="body-copy-edit"
            />
          </div>
        </header>

        <div className="donation-info-dialog-body">
          {info.sections.map((section, sectionIndex) => (
            <section key={`donation-info-section-${sectionIndex}`} className="donation-info-section">
              <div className="donation-info-section-head">
                <h4>
                  <InlineEditableText
                    editable={editable}
                    value={section.title}
                    onChange={(value) => onChangeSection?.(info.id, sectionIndex, value)}
                    className="section-title-edit"
                  />
                </h4>
                {editable ? (
                  <button className="admin-danger-button" type="button" onClick={() => onDeleteSection?.(info.id, sectionIndex)}>
                    Remove section
                  </button>
                ) : null}
              </div>
              <ul className="detail-list">
                {section.items.map((item, itemIndex) => (
                  <li key={`donation-info-item-${sectionIndex}-${itemIndex}`} className={editable ? "detail-list-edit-item" : undefined}>
                    <InlineEditableText
                      editable={editable}
                      value={item}
                      onChange={(value) => onChangeItem?.(info.id, sectionIndex, itemIndex, value)}
                      multiline
                      richText
                      className="body-copy-edit"
                    />
                    {editable ? (
                      <button
                        className="admin-danger-button"
                        type="button"
                        onClick={() => onDeleteItem?.(info.id, sectionIndex, itemIndex)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              {editable ? (
                <button className="secondary-button cause-dialog-add-line" type="button" onClick={() => onAddItem?.(info.id, sectionIndex)}>
                  Add bullet
                </button>
              ) : null}
            </section>
          ))}
          {editable ? (
            <button className="secondary-button cause-dialog-add-line" type="button" onClick={() => onAddSection?.(info.id)}>
              Add section
            </button>
          ) : null}
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
      <div className="donation-request-dialog-shell" onClick={(event) => event.stopPropagation()} tabIndex={-1} autoFocus>
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
                    <span>Batch</span>
                    <input
                      type="text"
                      value={form.batch}
                      maxLength={DONATION_REQUEST_BATCH_MAX_LENGTH}
                      onChange={(event) => onFieldChange("batch", event.target.value)}
                    />
                  </label>

                  <label>
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={form.phone}
                      maxLength={INQUIRY_PHONE_MAX_LENGTH}
                      inputMode="tel"
                      pattern={INQUIRY_PHONE_INPUT_PATTERN}
                      title="Phone numbers may only include a leading + and digits."
                      onChange={(event) => onFieldChange("phone", sanitizePhoneNumberInput(event.target.value))}
                    />
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
                        maxLength={DONATION_REQUEST_EMPLOYER_MAX_LENGTH}
                        onChange={(event) => onFieldChange("employerName", event.target.value)}
                      />
                    </label>
                    <label>
                      <span>Location</span>
                      <input
                        type="text"
                        value={form.employerLocation}
                        maxLength={DONATION_REQUEST_LOCATION_MAX_LENGTH}
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
                        maxLength={DONATION_REQUEST_ACCOUNT_NAME_MAX_LENGTH}
                        onChange={(event) => onFieldChange("proposedEndowmentName", event.target.value)}
                      />
                    </label>
                    <label>
                      <span>Cause</span>
                      <input
                        type="text"
                        value={form.proposedEndowmentCause}
                        maxLength={DONATION_REQUEST_CAUSE_MAX_LENGTH}
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
                {statusMessage ? (
                  <p className={`status-note ${statusTone}`} role={statusTone === "error" ? "alert" : "status"} aria-live={statusTone === "error" ? "assertive" : "polite"}>
                    {statusMessage}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
