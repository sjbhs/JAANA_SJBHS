import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ConnectPageContent,
  ConnectPageCopy,
  ConnectScheduleItem,
  ConnectSponsorEntry,
  TabConfig
} from "../types";
import { InlineEditableText } from "./InlineEditableText";
import { handleRovingTabKeyDown } from "../accessibility";
import { optimizedImageSrc } from "../optimizedImages";

type ConnectPageProps = {
  details: TabConfig;
  connectContent: ConnectPageContent;
  connectCopy: ConnectPageCopy;
  editable?: boolean;
  registrationOpenRequest?: number;
  onOpenStore?: () => void;
  onChangeDetails?: <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => void;
  onChangeConnectCopy?: <K extends keyof ConnectPageCopy>(key: K, value: ConnectPageCopy[K]) => void;
  onChangeConnectContent?: <K extends keyof ConnectPageContent>(key: K, value: ConnectPageContent[K]) => void;
};

type ConnectDialogType = "registration" | "sponsor";

const registrationFormUrl = "/embed/ticketing/jaana-north-america-connect--2026";
const registrationIframeUrl = "https://www.zeffy.com/embed/ticketing/jaana-north-america-connect--2026";
const sponsorFormUrl = "/embed/donation-form/north-america-connect-sponsorship";
const sponsorIframeUrl = "https://www.zeffy.com/embed/donation-form/north-america-connect-sponsorship";
const sponsorThermometerUrl = "https://www.zeffy.com/embed/thermometer/north-america-connect-sponsorship";
const connectPosterPdfUrl = "/docs/north-america-connect-2026-poster.pdf";
const connectPosterImageUrl = "/assets/north-america-connect-2026-poster.png";
const connectPosterImageWebpSmallUrl = "/assets/north-america-connect-2026-poster-360.webp";
const connectPosterImageWebpLargeUrl = "/assets/north-america-connect-2026-poster-612.webp";
const merchandiseStoreUrl = "/josephite-store";

const attractionPreviewLinks: Record<string, string> = {
  "Monuments & Memorials": "https://www.washington.org/visit-dc/monuments-memorials",
  "Smithsonian Museums": "https://www.si.edu/visit",
  "Old Town Alexandria": "https://visitalexandria.com/things-to-do/top-10-reasons-to-visit/",
  "Georgetown": "https://www.georgetowndc.com/guide/25-things-to-do-in-georgetown/",
  "Old Town Alexandria & Georgetown": "https://www.washington.org/visit-va/exploring-old-town-alexandria",
  "National Harbor": "https://www.nationalharbor.com/things-to-do/",
  "Michelin Star Restaurants": "https://guide.michelin.com/en/us/district-of-columbia/washington-dc/restaurants/1-star-michelin/2-stars-michelin",
  "Loudoun Wineries": "https://www.visitloudoun.org/food-and-drink/wine-country/wineries-and-tasting-rooms/",
  "LoCo Ale Trail": "https://www.visitloudoun.org/food-and-drink/loco-ale-trail/",
  "Wineries & Craft Breweries": "https://www.visitloudoun.org/food-and-drink/",
  "Historic Districts": "https://www.fxva.com/explore/history/",
  "Trails & Nature Centers": "https://www.fairfaxcounty.gov/parks/lake-fairfax",
  "DC Nightlife": "https://washington.org/visit-dc/entertainment-nightlife"
};

const airportWebsiteLinks: Record<string, string> = {
  BWI: "https://bwiairport.com/",
  DCA: "https://www.flyreagan.com/",
  IAD: "https://www.flydulles.com/"
};

const sectionAnchors: Record<string, string> = {
  pricing: "connect-pricing",
  schedule: "connect-schedule",
  travel: "connect-travel",
  stay: "connect-stay",
  "travel-stay": "connect-travel",
  "travel-and-stay": "connect-travel",
  "josephite-merchandise": "connect-merchandise",
  "local-attractions": "connect-attractions",
  sponsor: "connect-sponsors",
  sponsors: "connect-sponsors",
  sponsorship: "connect-sponsors"
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sectionAnchorFor(label: string) {
  const slug = slugify(label);
  return sectionAnchors[slug] ?? `connect-${slug || "details"}`;
}

function updateArrayItem<T>(items: T[], index: number, updater: (item: T) => T) {
  return items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}

function updateStringItem(items: string[], index: number, value: string) {
  return updateArrayItem(items, index, () => value);
}

function resolveHref(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^(https?:|mailto:|tel:)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function sponsorTierName(value: string | undefined) {
  return (value ?? "Sponsor").replace(/\s+sponsors?$/i, "").trim() || "Sponsor";
}

function sponsorTierSlug(value: string | undefined) {
  return slugify(sponsorTierName(value));
}

function sponsorBatchShort(value: string | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");

  return digits.length >= 2 ? digits.slice(-2) : (value ?? "").trim();
}

function sponsorRecognition(sponsor: ConnectSponsorEntry) {
  const alumni = sponsor.alumni?.trim();
  const batch = sponsor.batch?.trim();

  if (!alumni && !batch) {
    return "";
  }

  if (alumni && /^(batch|class)\b/i.test(alumni)) {
    return alumni;
  }

  if (alumni && batch) {
    return `${alumni} '${sponsorBatchShort(batch)}`;
  }

  if (alumni) {
    return alumni;
  }

  return `Batch of ${batch}`;
}

function airportWebsiteHref(airportCode: string) {
  return airportWebsiteLinks[airportCode.trim().toUpperCase()] ?? "";
}

function attractionPreviewUrl(attraction: string) {
  const trimmedAttraction = attraction.trim();
  const fallbackSearchQuery = encodeURIComponent(`${trimmedAttraction || "local attractions"} near Sterling VA`);

  return attractionPreviewLinks[trimmedAttraction] ?? `https://www.google.com/search?q=${fallbackSearchQuery}`;
}

function promoCodeFromLabel(value: string) {
  return value.match(/\b[A-Z0-9]{6,}\b/)?.[0] ?? value;
}

function ConnectZeffyDialog({
  type,
  connectContent,
  onClose
}: {
  type: ConnectDialogType | null;
  connectContent: ConnectPageContent;
  onClose: () => void;
}) {
  const isSponsor = type === "sponsor";
  const title = isSponsor ? "Become a Sponsor" : "Register Today";
  const iframeUrl = isSponsor ? sponsorIframeUrl : registrationIframeUrl;
  const formUrl = isSponsor ? sponsorFormUrl : registrationFormUrl;

  useEffect(() => {
    if (!type) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, type]);

  if (!type) {
    return null;
  }

  return createPortal(
    <div className="zeffy-dialog connect-zeffy-dialog" role="dialog" aria-modal="true" aria-labelledby="connect-zeffy-title" onClick={onClose}>
      <div
        className={`zeffy-dialog-shell connect-zeffy-shell ${isSponsor ? "is-sponsor" : "is-registration"}`}
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
        autoFocus
      >
        <header className="zeffy-dialog-header connect-zeffy-header">
          <button className="zeffy-dialog-close" type="button" onClick={onClose} aria-label={`Close ${title} form`}>
            ×
          </button>
          <p className="support-note">Secure form powered by Zeffy</p>
          <h3 id="connect-zeffy-title">{title}</h3>
          {isSponsor ? (
            <>
              <p>
                The Josephite Alumni Association of North America (JAANA), in partnership with Learn For Life Foundation
                (LFL), invites you to sponsor North America Connect, a two-day event hosted in the Washington D.C. metro
                area on September 19th and 20th, 2026.
              </p>
              <div className="connect-dialog-tier-strip" aria-label="Sponsorship tiers">
                {connectContent.sponsorTiers.map((tier) => (
                  <span key={`${tier.title}-${tier.amount}`}>
                    <strong>{tier.title.replace(" Sponsors", " Tier")}</strong>
                    {tier.amount}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p>
              Register for the Saturday gala, Sunday picnic, or the full North America Connect 2026 reunion weekend.
            </p>
          )}
        </header>

        {isSponsor ? (
          <div className="connect-dialog-sponsor-context">
            <ul>
              {connectContent.sponsorDetails.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="connect-thermometer-frame">
              <iframe
                title="North America Connect sponsorship thermometer powered by Zeffy"
                src={sponsorThermometerUrl}
              />
            </div>
          </div>
        ) : null}

        <div className="zeffy-dialog-embed connect-zeffy-embed" data-form-url={formUrl}>
          <iframe
            className="connect-zeffy-frame"
            title={`${title} form powered by Zeffy`}
            src={iframeUrl}
            allow="payment"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function ConnectFloatingRegisterButton({ onClick }: { onClick: () => void }) {
  return createPortal(
    <button
      className="primary-button connect-floating-register"
      type="button"
      onClick={onClick}
      aria-label="Register today for North America Connect 2026"
    >
      Register Today
    </button>,
    document.body
  );
}

function ConnectPosterPicture({
  className,
  sizes,
  priority = false
}: {
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <picture className={className}>
      <source
        type="image/webp"
        srcSet={`${connectPosterImageWebpSmallUrl} 360w, ${connectPosterImageWebpLargeUrl} 612w`}
        sizes={sizes}
      />
      <img
        src={connectPosterImageUrl}
        alt="North America Connect 2026 event poster"
        width="612"
        height="792"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}

function ConnectPosterDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return createPortal(
    <div className="connect-poster-dialog" role="dialog" aria-modal="true" aria-label="North America Connect 2026 poster" onClick={onClose}>
      <div className="connect-poster-dialog-shell" onClick={(event) => event.stopPropagation()}>
        <button className="zeffy-dialog-close connect-poster-dialog-close" type="button" onClick={onClose} aria-label="Close poster">
          ×
        </button>
        <a className="connect-poster-dialog-pdf-link" href={connectPosterPdfUrl} target="_blank" rel="noreferrer">
          Open PDF
        </a>
        <ConnectPosterPicture className="connect-poster-dialog-picture" sizes="min(100vw, 612px)" priority />
      </div>
    </div>,
    document.body
  );
}

function ScheduleCard({
  item,
  index,
  editable,
  onChange
}: {
  item: ConnectScheduleItem;
  index: number;
  editable: boolean;
  onChange: (value: ConnectScheduleItem) => void;
}) {
  const mapHref = resolveHref(item.mapHref ?? "");

  return (
    <article className="connect-schedule-card">
      <span className="connect-card-number">{String(index + 1).padStart(2, "0")}</span>
      <h4>
        <InlineEditableText
          editable={editable}
          value={item.title}
          onChange={(value) => onChange({ ...item, title: value })}
          className="section-title-edit"
          ariaLabel={`Schedule item ${index + 1} title`}
        />
      </h4>
      <p className="connect-card-time">
        <InlineEditableText
          editable={editable}
          value={item.dateTime}
          onChange={(value) => onChange({ ...item, dateTime: value })}
          className="body-copy-edit"
          ariaLabel={`Schedule item ${index + 1} time`}
        />
      </p>
      <p>
        <strong>
          <InlineEditableText
            editable={editable}
            value={item.venue}
            onChange={(value) => onChange({ ...item, venue: value })}
            className="body-copy-edit"
            ariaLabel={`Schedule item ${index + 1} venue`}
          />
        </strong>
      </p>
      <p>
        {editable || !mapHref ? (
          <InlineEditableText
            editable={editable}
            value={item.address}
            onChange={(value) => onChange({ ...item, address: value })}
            className="body-copy-edit"
            ariaLabel={`Schedule item ${index + 1} address`}
          />
        ) : (
          <a className="connect-map-link" href={mapHref} target="_blank" rel="noreferrer">
            {item.address}
          </a>
        )}
      </p>
      {editable ? (
        <p>
          <InlineEditableText
            editable
            value={item.mapHref ?? ""}
            onChange={(value) => onChange({ ...item, mapHref: value })}
            className="body-copy-edit"
            placeholder="Google Maps URL"
            ariaLabel={`Schedule item ${index + 1} Google Maps URL`}
          />
        </p>
      ) : null}
      <div className="connect-chip-list" aria-label={`${item.title} highlights`}>
        {item.highlights.map((highlight, highlightIndex) => (
          <span key={`${highlight}-${highlightIndex}`}>
            <InlineEditableText
              editable={editable}
              value={highlight}
              onChange={(value) => onChange({ ...item, highlights: updateStringItem(item.highlights, highlightIndex, value) })}
              className="body-copy-edit"
              ariaLabel={`Schedule item ${index + 1} highlight ${highlightIndex + 1}`}
            />
          </span>
        ))}
      </div>
    </article>
  );
}

function SponsorCard({
  sponsor,
  editable,
  onChange
}: {
  sponsor: ConnectSponsorEntry;
  editable: boolean;
  onChange: (value: ConnectSponsorEntry) => void;
}) {
  const sponsorHref = resolveHref(sponsor.website);
  const tierName = sponsorTierName(sponsor.tier);
  const tierSlug = sponsorTierSlug(sponsor.tier);
  const recognition = sponsorRecognition(sponsor);
  const displayHref = sponsorHref.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const cardClassName = `connect-sponsor-card is-${tierSlug}${sponsorHref && !editable ? " is-linked" : ""}`;
  const sponsorName = (
    <InlineEditableText
      editable={editable}
      value={sponsor.name}
      onChange={(value) => onChange({ ...sponsor, name: value })}
      className="section-title-edit"
      ariaLabel="Sponsor name"
    />
  );
  const cardContent = (
    <>
      <div className="connect-sponsor-logo">
        <img src={optimizedImageSrc(sponsor.logoSrc)} alt={sponsor.logoAlt} loading="lazy" decoding="async" />
      </div>
      <div className="connect-sponsor-card-body">
        <span className={`connect-sponsor-badge is-${tierSlug}`}>{tierName}</span>
        <h5>{sponsorName}</h5>
        {recognition ? (
          <p className="connect-sponsor-recognition">
            <span className="connect-sponsor-field-label">Donor</span>
            {recognition}
          </p>
        ) : null}
        {sponsorHref ? (
          <p className="connect-sponsor-url-line">
            <span className="connect-sponsor-field-label">Website</span>
            {editable ? (
              <a href={sponsorHref} target="_blank" rel="noreferrer">
                {displayHref}
              </a>
            ) : (
              <span className="connect-sponsor-url-value" aria-hidden="true">
                {displayHref}
              </span>
            )}
          </p>
        ) : null}
        {editable ? (
          <div className="connect-admin-field-stack">
            <InlineEditableText
              editable
              value={sponsor.website}
              onChange={(value) => onChange({ ...sponsor, website: value })}
              className="body-copy-edit"
              placeholder="Sponsor website URL"
              ariaLabel="Sponsor website URL"
            />
            <InlineEditableText
              editable
              value={sponsor.logoSrc}
              onChange={(value) => onChange({ ...sponsor, logoSrc: value })}
              className="body-copy-edit"
              placeholder="Sponsor logo path"
              ariaLabel="Sponsor logo path"
            />
            <InlineEditableText
              editable
              value={sponsor.logoAlt}
              onChange={(value) => onChange({ ...sponsor, logoAlt: value })}
              className="body-copy-edit"
              placeholder="Sponsor logo alt text"
              ariaLabel="Sponsor logo alt text"
            />
            <InlineEditableText
              editable
              value={sponsor.tier ?? ""}
              onChange={(value) => onChange({ ...sponsor, tier: value })}
              className="body-copy-edit"
              placeholder="Sponsor tier"
              ariaLabel="Sponsor tier"
            />
            <InlineEditableText
              editable
              value={sponsor.alumni ?? ""}
              onChange={(value) => onChange({ ...sponsor, alumni: value })}
              className="body-copy-edit"
              placeholder="Sponsor alumni name"
              ariaLabel="Sponsor alumni name"
            />
            <InlineEditableText
              editable
              value={sponsor.batch ?? ""}
              onChange={(value) => onChange({ ...sponsor, batch: value })}
              className="body-copy-edit"
              placeholder="Sponsor batch year"
              ariaLabel="Sponsor batch year"
            />
          </div>
        ) : null}
      </div>
    </>
  );

  if (sponsorHref && !editable) {
    return (
      <a className={cardClassName} href={sponsorHref} target="_blank" rel="noreferrer" aria-label={`Open ${sponsor.name} website`}>
        {cardContent}
      </a>
    );
  }

  return (
    <article className={cardClassName}>
      {cardContent}
    </article>
  );
}

export function ConnectPage({
  details,
  connectContent,
  connectCopy,
  editable = false,
  registrationOpenRequest = 0,
  onOpenStore,
  onChangeDetails,
  onChangeConnectCopy,
  onChangeConnectContent
}: ConnectPageProps) {
  const [dialogType, setDialogType] = useState<ConnectDialogType | null>(null);
  const [activeSponsorTier, setActiveSponsorTier] = useState(0);
  const [showFloatingRegister, setShowFloatingRegister] = useState(false);
  const [posterDialogOpen, setPosterDialogOpen] = useState(false);
  const [storeRedirectDialogOpen, setStoreRedirectDialogOpen] = useState(false);
  const heroRegisterButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setActiveSponsorTier((current) => Math.min(current, Math.max(connectContent.sponsorTiers.length - 1, 0)));
  }, [connectContent.sponsorTiers.length]);

  useEffect(() => {
    if (!editable && registrationOpenRequest > 0) {
      setDialogType("registration");
    }
  }, [editable, registrationOpenRequest]);

  useEffect(() => {
    if (editable) {
      setShowFloatingRegister(false);
      return;
    }

    const updateFloatingRegister = () => {
      const heroButtonRect = heroRegisterButtonRef.current?.getBoundingClientRect();
      const heroButtonPast = heroButtonRect ? heroButtonRect.bottom < 0 : true;

      setShowFloatingRegister(heroButtonPast);
    };

    updateFloatingRegister();
    window.addEventListener("scroll", updateFloatingRegister, { passive: true });
    window.addEventListener("resize", updateFloatingRegister);

    return () => {
      window.removeEventListener("scroll", updateFloatingRegister);
      window.removeEventListener("resize", updateFloatingRegister);
    };
  }, [editable]);

  const activeTier = connectContent.sponsorTiers[activeSponsorTier] ?? connectContent.sponsorTiers[0];
  const unitedDiscountHref = resolveHref(connectContent.travel.discountHref);
  const unitedPromoCode = promoCodeFromLabel(connectContent.travel.discountLabel);
  const hotelBlockHref = resolveHref(connectContent.stay.hotelBlockHref);
  const recommendedAirportHref = airportWebsiteHref(connectContent.travel.recommendedAirport);

  return (
    <section id="connect-panel" className="subpage-shell" role="tabpanel" aria-label="North America Connect 2026">
      <div className="connect-hero">
        <div className="connect-hero-copy">
          <h2>
            <InlineEditableText
              editable={editable}
              value={details.title}
              onChange={(value) => onChangeDetails?.("title", value)}
              className="section-title-edit"
            />
          </h2>
          <div className="body-copy connect-hero-body">
            <InlineEditableText
              editable={editable}
              value={details.copy}
              onChange={(value) => onChangeDetails?.("copy", value)}
              multiline
              richText
              className="body-copy-edit"
            />
          </div>
          <div className="connect-hero-actions">
            <button
              ref={heroRegisterButtonRef}
              className="primary-button connect-register-button"
              type="button"
              onClick={() => setDialogType("registration")}
            >
              Register Today
            </button>
          </div>
        </div>

        <aside className="connect-event-panel connect-poster-panel">
          <button
            className="connect-poster-preview"
            type="button"
            onClick={() => setPosterDialogOpen(true)}
            aria-label="Open North America Connect 2026 poster full screen"
          >
            <ConnectPosterPicture
              className="connect-poster-picture"
              sizes="(max-width: 720px) 88vw, (max-width: 1100px) 39vw, 430px"
              priority
            />
          </button>
        </aside>
      </div>

      <nav className="connect-detail-nav" aria-label="North America Connect details">
        <span>Find all details here:</span>
        <div>
          {connectContent.detailLinks.map((linkLabel, index) => (
            <a key={`${linkLabel}-${index}`} href={`#${sectionAnchorFor(linkLabel)}`}>
              {editable ? (
                <InlineEditableText
                  editable
                  value={linkLabel}
                  onChange={(value) => onChangeConnectContent?.("detailLinks", updateStringItem(connectContent.detailLinks, index, value))}
                  className="body-copy-edit"
                  ariaLabel={`Detail link ${index + 1}`}
                />
              ) : (
                linkLabel
              )}
            </a>
          ))}
        </div>
      </nav>

      <section className="connect-section connect-merchandise-section" aria-labelledby="connect-merchandise-title">
        <article id="connect-merchandise" className="connect-info-panel connect-merchandise-panel">
          <div className="connect-merchandise-copy">
            <p className="connect-merchandise-kicker">Storefront</p>
            <h3 id="connect-merchandise-title">Josephite Merchandise</h3>
            <p>
              <InlineEditableText
                editable={editable}
                value={connectContent.merchandise.body}
                onChange={(value) => onChangeConnectContent?.("merchandise", { ...connectContent.merchandise, body: value })}
                className="body-copy-edit"
                ariaLabel="Merchandise body"
              />
            </p>
            <p>
              <InlineEditableText
                editable={editable}
                value={connectContent.merchandise.preorder}
                onChange={(value) => onChangeConnectContent?.("merchandise", { ...connectContent.merchandise, preorder: value })}
                className="body-copy-edit"
                ariaLabel="Merchandise preorder details"
              />
            </p>
            {!editable ? (
              <button
                className="primary-button connect-store-button"
                type="button"
                onClick={() => setStoreRedirectDialogOpen(true)}
              >
                Open Josephite Store
              </button>
            ) : null}
          </div>
          <div className="connect-merchandise-preview" aria-hidden="true">
            <img src={optimizedImageSrc("/assets/merchandise/alumni-essentials-bundle.png")} alt="" loading="lazy" decoding="async" />
            <div>
              <img src={optimizedImageSrc("/assets/merchandise/cap.png")} alt="" loading="lazy" decoding="async" />
              <img src={optimizedImageSrc("/assets/merchandise/metal-water-bottle.png")} alt="" loading="lazy" decoding="async" />
              <img src={optimizedImageSrc("/assets/merchandise/luggage-tag.png")} alt="" loading="lazy" decoding="async" />
              <img src={optimizedImageSrc("/assets/merchandise/scarf.png")} alt="" loading="lazy" decoding="async" />
            </div>
          </div>
        </article>
      </section>

      <section id="connect-pricing" className="connect-section connect-pricing-section" aria-labelledby="connect-pricing-title">
        <div className="featured-heading">
          <div>
            <h3 id="connect-pricing-title">Pricing</h3>
          </div>
        </div>
        <div className="connect-pricing-grid">
          {connectContent.pricing.map((pricingGroup, groupIndex) => (
            <article className="connect-pricing-card" key={`${pricingGroup.title}-${groupIndex}`}>
              <p className="connect-price-period">
                <InlineEditableText
                  editable={editable}
                  value={pricingGroup.period}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "pricing",
                      updateArrayItem(connectContent.pricing, groupIndex, (item) => ({ ...item, period: value }))
                    )
                  }
                  className="body-copy-edit"
                  ariaLabel={`Pricing period ${groupIndex + 1}`}
                />
              </p>
              <h4>
                <InlineEditableText
                  editable={editable}
                  value={pricingGroup.title}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "pricing",
                      updateArrayItem(connectContent.pricing, groupIndex, (item) => ({ ...item, title: value }))
                    )
                  }
                  className="section-title-edit"
                  ariaLabel={`Pricing title ${groupIndex + 1}`}
                />
              </h4>
              <ul>
                {pricingGroup.options.map((option, optionIndex) => (
                  <li key={`${option}-${optionIndex}`}>
                    <InlineEditableText
                      editable={editable}
                      value={option}
                      onChange={(value) =>
                        onChangeConnectContent?.(
                          "pricing",
                          updateArrayItem(connectContent.pricing, groupIndex, (item) => ({
                            ...item,
                            options: updateStringItem(item.options, optionIndex, value)
                          }))
                        )
                      }
                      className="body-copy-edit"
                      ariaLabel={`Pricing option ${optionIndex + 1}`}
                    />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="connect-free-grid">
          {connectContent.complimentaryTickets.map((ticket, index) => (
            <p key={`${ticket}-${index}`}>
              <InlineEditableText
                editable={editable}
                value={ticket}
                onChange={(value) => onChangeConnectContent?.("complimentaryTickets", updateStringItem(connectContent.complimentaryTickets, index, value))}
                className="body-copy-edit"
                ariaLabel={`Complimentary ticket ${index + 1}`}
              />
            </p>
          ))}
        </div>
      </section>

      <section id="connect-schedule" className="connect-section" aria-labelledby="connect-schedule-title">
        <div className="featured-heading">
          <div>
            <h3 id="connect-schedule-title">
              <InlineEditableText
                editable={editable}
                value={connectCopy.scheduleHeading}
                onChange={(value) => onChangeConnectCopy?.("scheduleHeading", value)}
                className="section-title-edit"
              />
            </h3>
            <div className="body-copy">
              <InlineEditableText
                editable={editable}
                value={connectCopy.scheduleBody}
                onChange={(value) => onChangeConnectCopy?.("scheduleBody", value)}
                multiline
                richText
                className="body-copy-edit"
              />
            </div>
          </div>
        </div>
        <div className="connect-schedule-grid">
          {connectContent.schedule.map((scheduleItem, scheduleIndex) => (
            <ScheduleCard
              key={`${scheduleItem.title}-${scheduleIndex}`}
              item={scheduleItem}
              index={scheduleIndex}
              editable={editable}
              onChange={(value) =>
                onChangeConnectContent?.("schedule", updateArrayItem(connectContent.schedule, scheduleIndex, () => value))
              }
            />
          ))}
        </div>
      </section>

      <section className="connect-section connect-logistics" aria-label="Travel and stay details">
        <article id="connect-travel" className="connect-info-panel connect-travel-panel">
          <h3>Travel</h3>
          <div className="connect-travel-layout">
            <div className="connect-airport-summary">
              <div className="connect-airport-copy">
                <span>Recommended airport</span>
                <strong>
                  {recommendedAirportHref && !editable ? (
                    <a className="connect-airport-link" href={recommendedAirportHref} target="_blank" rel="noreferrer">
                      {connectContent.travel.recommendedAirport}
                    </a>
                  ) : (
                    <InlineEditableText
                      editable={editable}
                      value={connectContent.travel.recommendedAirport}
                      onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, recommendedAirport: value })}
                      className="body-copy-edit"
                      ariaLabel="Recommended airport"
                    />
                  )}
                </strong>
                <p>Best arrival point for the Washington, D.C. metro area events.</p>
                {editable ? (
                  <div className="connect-admin-field-stack">
                    <InlineEditableText
                      editable
                      value={connectContent.travel.airportImageSrc}
                      onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, airportImageSrc: value })}
                      className="body-copy-edit"
                      placeholder="Airport image path"
                      ariaLabel="Airport image path"
                    />
                    <InlineEditableText
                      editable
                      value={connectContent.travel.airportImageAlt}
                      onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, airportImageAlt: value })}
                      className="body-copy-edit"
                      placeholder="Airport image alt text"
                      ariaLabel="Airport image alt text"
                    />
                  </div>
                ) : null}
              </div>
              <figure className="connect-airport-glimpse">
                <img
                  src={optimizedImageSrc(connectContent.travel.airportImageSrc)}
                  alt={connectContent.travel.airportImageAlt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>

            <div className="connect-travel-secondary">
              <div className="connect-promo-card">
                <span>United Airlines discount</span>
                {unitedDiscountHref && !editable ? (
                  <a className="connect-promo-link" href={unitedDiscountHref} target="_blank" rel="noreferrer">
                    <strong>{unitedPromoCode}</strong>
                    <small>Applicable for travel to/from IAD between 9/18-9/21</small>
                  </a>
                ) : (
                  <div className="connect-promo-edit-stack">
                    <InlineEditableText
                      editable={editable}
                      value={connectContent.travel.discountLabel}
                      onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, discountLabel: value })}
                      className="body-copy-edit"
                      ariaLabel="United discount label"
                    />
                    {!editable ? <span className="connect-coming-soon">Link coming soon</span> : null}
                  </div>
                )}
                {editable ? (
                  <InlineEditableText
                    editable
                    value={connectContent.travel.discountHref}
                    onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, discountHref: value })}
                    className="body-copy-edit"
                    placeholder="United discount URL"
                    ariaLabel="United discount URL"
                  />
                ) : null}
              </div>

              <div className="connect-airport-options">
                <span>Other airports</span>
                <div className="connect-inline-list">
                {connectContent.travel.otherAirports.map((airport, airportIndex) => {
                  const airportHref = airportWebsiteHref(airport);
                  const isLinkedAirport = Boolean(airportHref) && !editable;

                  return (
                    <span className={isLinkedAirport ? "connect-airport-chip" : undefined} key={`${airport}-${airportIndex}`}>
                      {isLinkedAirport ? (
                        <a className="connect-airport-chip-link" href={airportHref} target="_blank" rel="noreferrer">
                          {airport}
                        </a>
                      ) : (
                        <InlineEditableText
                          editable={editable}
                          value={airport}
                          onChange={(value) =>
                            onChangeConnectContent?.("travel", {
                              ...connectContent.travel,
                              otherAirports: updateStringItem(connectContent.travel.otherAirports, airportIndex, value)
                            })
                          }
                          className="body-copy-edit"
                          ariaLabel={`Other airport ${airportIndex + 1}`}
                        />
                      )}
                    </span>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article id="connect-stay" className="connect-info-panel connect-stay-panel">
          <h3>Stay</h3>
          <div className="connect-hotel-preview">
            <img
              src={optimizedImageSrc(connectContent.stay.hotelImageSrc)}
              alt={connectContent.stay.hotelImageAlt}
              loading="lazy"
              decoding="async"
            />
            <div>
              <strong>
                <InlineEditableText
                  editable={editable}
                  value={connectContent.stay.hotelName}
                  onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, hotelName: value })}
                  className="section-title-edit"
                  ariaLabel="Hotel name"
                />
              </strong>
              <p>
                <InlineEditableText
                  editable={editable}
                  value={connectContent.stay.address}
                  onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, address: value })}
                  className="body-copy-edit"
                  ariaLabel="Hotel address"
                />
              </p>
              {editable ? (
                <div className="connect-admin-field-stack">
                  <InlineEditableText
                    editable
                    value={connectContent.stay.hotelImageSrc}
                    onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, hotelImageSrc: value })}
                    className="body-copy-edit"
                    placeholder="Hotel image path"
                    ariaLabel="Hotel image path"
                  />
                  <InlineEditableText
                    editable
                    value={connectContent.stay.hotelImageAlt}
                    onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, hotelImageAlt: value })}
                    className="body-copy-edit"
                    placeholder="Hotel image alt text"
                    ariaLabel="Hotel image alt text"
                  />
                </div>
              ) : null}
            </div>
          </div>
          <dl className="connect-detail-list">
            <div className="connect-stay-detail connect-stay-detail--group-code">
              <dt>Group Code</dt>
              <dd>
                {hotelBlockHref && !editable ? (
                  <a className="inline-link" href={hotelBlockHref} target="_blank" rel="noreferrer">
                    {connectContent.stay.hotelBlockLabel}
                  </a>
                ) : (
                  <>
                    <InlineEditableText
                      editable={editable}
                      value={connectContent.stay.hotelBlockLabel}
                      onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, hotelBlockLabel: value })}
                      className="body-copy-edit"
                      ariaLabel="Hotel block label"
                    />
                    {!editable ? <span className="connect-coming-soon">Link coming soon</span> : null}
                  </>
                )}
                {editable ? (
                  <InlineEditableText
                    editable
                    value={connectContent.stay.hotelBlockHref}
                    onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, hotelBlockHref: value })}
                    className="body-copy-edit"
                    placeholder="Hotel block URL"
                    ariaLabel="Hotel block URL"
                  />
                ) : null}
              </dd>
            </div>
            <div className="connect-stay-detail connect-stay-detail--room-block">
              <dt>Room Block</dt>
              <dd>
                <InlineEditableText
                  editable={editable}
                  value={connectContent.stay.courtesyBlock}
                  onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, courtesyBlock: value })}
                  className="body-copy-edit"
                  ariaLabel="Stay room block"
                />
              </dd>
            </div>
          </dl>
        </article>

        <article className="connect-shuttle-panel" aria-label="Travel and hotel shuttle details">
          <dl className="connect-detail-list">
            <div className="connect-shuttle-detail">
              <dt>Shuttle:</dt>
              <dd>
                <InlineEditableText
                  editable={editable}
                  value={connectContent.stay.shuttle}
                  onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, shuttle: value })}
                  className="body-copy-edit"
                  ariaLabel="Stay shuttle"
                />
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="connect-section connect-attractions-section" aria-labelledby="connect-attractions-title">
        <article id="connect-attractions" className="connect-info-panel connect-attractions-panel">
          <h3 id="connect-attractions-title">Local Attractions</h3>
          <p className="connect-attractions-note">Select a box below to view more information.</p>
          <div className="connect-attraction-grid">
            {connectContent.attractions.map((attraction, index) =>
              editable ? (
                <span key={`${attraction}-${index}`}>
                  <InlineEditableText
                    editable={editable}
                    value={attraction}
                    onChange={(value) => onChangeConnectContent?.("attractions", updateStringItem(connectContent.attractions, index, value))}
                    className="body-copy-edit"
                    ariaLabel={`Local attraction ${index + 1}`}
                  />
                </span>
              ) : (
                <a
                  key={`${attraction}-${index}`}
                  className="connect-attraction-link"
                  href={attractionPreviewUrl(attraction)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${attraction} preview`}
                >
                  {attraction}
                </a>
              )
            )}
          </div>
        </article>
      </section>

      <section
        id="connect-sponsors"
        className="connect-section connect-sponsor-section"
        aria-labelledby="connect-sponsors-title"
      >
        <div className="connect-sponsor-copy">
          <h3 id="connect-sponsors-title">
            <InlineEditableText
              editable={editable}
              value={connectCopy.sponsorHeading}
              onChange={(value) => onChangeConnectCopy?.("sponsorHeading", value)}
              className="section-title-edit"
            />
          </h3>
          <div className="body-copy">
            <InlineEditableText
              editable={editable}
              value={connectContent.sponsorMessage || connectCopy.sponsorBody}
              onChange={(value) => onChangeConnectContent?.("sponsorMessage", value)}
              multiline
              richText
              className="body-copy-edit"
            />
          </div>
          <div className="connect-sponsor-actions">
            <button className="primary-button" type="button" onClick={() => setDialogType("sponsor")}>
              Become a Sponsor
            </button>
            <a className="secondary-button" href="/docs/north-america-connect-2026-call-for-sponsors.pdf" target="_blank" rel="noreferrer">
              View sponsor packet
            </a>
          </div>
        </div>

        <div className="connect-tier-panel">
          <div className="connect-tier-panel-head">
            <span>Sponsor levels</span>
            <p>Recognition is available for corporate sponsors, individual benefactors, and class batches.</p>
          </div>
          <div className="connect-tier-tabs" role="tablist" aria-label="Sponsor tiers">
            {connectContent.sponsorTiers.map((tier, index) => (
              <button
                key={`${tier.title}-${index}`}
                type="button"
                id={`connect-sponsor-tier-tab-${index}`}
                role="tab"
                aria-selected={activeSponsorTier === index}
                aria-controls={`connect-sponsor-tier-panel-${index}`}
                tabIndex={activeSponsorTier === index ? 0 : -1}
                className={`connect-schedule-tab is-tier-${sponsorTierSlug(tier.title)} ${activeSponsorTier === index ? "is-active" : ""}`}
                onClick={() => setActiveSponsorTier(index)}
                onKeyDown={handleRovingTabKeyDown}
              >
                {tier.title}
              </button>
            ))}
          </div>

          {activeTier ? (
            <div
              id={`connect-sponsor-tier-panel-${activeSponsorTier}`}
              className={`connect-tier-detail is-tier-${sponsorTierSlug(activeTier.title)}`}
              role="tabpanel"
              aria-labelledby={`connect-sponsor-tier-tab-${activeSponsorTier}`}
              tabIndex={0}
            >
              <h4>
                <InlineEditableText
                  editable={editable}
                  value={activeTier.title}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "sponsorTiers",
                      updateArrayItem(connectContent.sponsorTiers, activeSponsorTier, (tier) => ({ ...tier, title: value }))
                    )
                  }
                  className="section-title-edit"
                  ariaLabel="Active sponsor tier title"
                />
              </h4>
              <p>
                <InlineEditableText
                  editable={editable}
                  value={activeTier.amount}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "sponsorTiers",
                      updateArrayItem(connectContent.sponsorTiers, activeSponsorTier, (tier) => ({ ...tier, amount: value }))
                    )
                  }
                  className="body-copy-edit"
                  ariaLabel="Active sponsor tier amount"
                />
              </p>
            </div>
          ) : null}
        </div>

        <div className="connect-sponsor-directory" aria-label="Confirmed sponsor list">
          <div className="connect-sponsor-directory-head">
            <span>With deepest gratitude</span>
            <h4>Thank you to our generous sponsors</h4>
          </div>
          <div className="connect-sponsor-grid connect-sponsor-directory-grid">
            {connectContent.sponsors.map((sponsor, sponsorIndex) => (
              <SponsorCard
                key={`${sponsor.name}-${sponsorIndex}`}
                sponsor={sponsor}
                editable={editable}
                onChange={(value) =>
                  onChangeConnectContent?.("sponsors", updateArrayItem(connectContent.sponsors, sponsorIndex, () => value))
                }
              />
            ))}
          </div>
        </div>
      </section>

      {!editable && showFloatingRegister ? <ConnectFloatingRegisterButton onClick={() => setDialogType("registration")} /> : null}

      <ConnectZeffyDialog type={dialogType} connectContent={connectContent} onClose={() => setDialogType(null)} />
      {posterDialogOpen ? <ConnectPosterDialog onClose={() => setPosterDialogOpen(false)} /> : null}
      {storeRedirectDialogOpen
        ? createPortal(
        <div className="store-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="connect-store-confirm-title">
          <div className="store-confirm-dialog">
            <p className="store-kicker">Opening store</p>
            <h2 id="connect-store-confirm-title">Open JAANA Store?</h2>
            <p>This will redirect you to the Josephite Store.</p>
            <div className="store-confirm-actions">
              <button className="secondary-button" type="button" onClick={() => setStoreRedirectDialogOpen(false)}>
                Cancel
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  setStoreRedirectDialogOpen(false);
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                  if (onOpenStore) {
                    onOpenStore();
                    return;
                  }

                  window.location.href = merchandiseStoreUrl;
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>,
            document.body
          )
        : null}
    </section>
  );
}
