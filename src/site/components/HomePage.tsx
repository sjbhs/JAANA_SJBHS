import { GalleryImage, TabId, HomePageCopy } from "../types";
import { InlineEditableText } from "./InlineEditableText";
import { optimizedImageSrc } from "../optimizedImages";

type HomePageProps = {
  connectMoments: GalleryImage[];
  homeCopy: HomePageCopy;
  editable?: boolean;
  onChangeHomeCopy?: <K extends keyof HomePageCopy>(key: K, value: HomePageCopy[K]) => void;
  onActivateTab: (tabId: TabId) => void;
  onOpenStore: () => void;
  onOpenPastEventsDialog: () => void;
  onOpenLightboxImage: (image: GalleryImage) => void;
};

export function HomePage({
  connectMoments,
  homeCopy,
  editable = false,
  onChangeHomeCopy,
  onActivateTab,
  onOpenStore,
  onOpenPastEventsDialog,
  onOpenLightboxImage
}: HomePageProps) {
  return (
    <>
      <section className="home-featured-now" aria-label="Featured reunion and merchandise">
        <div className="home-featured-now-heading">
          <span>Featured now</span>
          <p>Reconnect with Josephites—and bring a piece of St. Joseph&apos;s home.</p>
        </div>

        <div className="home-featured-now-grid">
          <article className="home-feature-card home-reunion-card">
            <div className="home-feature-card-copy">
              <span className="home-feature-kicker">September 19–20 · Northern Virginia</span>
              <strong>North America Connect 2026</strong>
              <p>A full reunion weekend of fellowship, celebration, and support for the Teachers Insurance Program.</p>
              <button className="home-feature-button" type="button" onClick={() => onActivateTab("connect")}>
                Reunion details &amp; registration
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="home-feature-poster" aria-hidden="true">
              <img src="/assets/north-america-connect-2026-poster-360.webp" alt="" />
            </div>
          </article>

          <article className="home-feature-card home-store-card">
            <div className="home-feature-card-copy">
              <span className="home-feature-kicker">The Josephite Store</span>
              <strong>Wear it. Gift it. Remember it.</strong>
              <p>Shop house merchandise, alumni essentials, books, gifts, and reunion-ready Josephite favorites.</p>
              <button className="home-feature-button" type="button" onClick={onOpenStore}>
                Shop merchandise
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="home-feature-products" aria-hidden="true">
              <img src="/assets/merchandise/optimized/metal-water-bottle.webp" alt="" />
              <img src="/assets/merchandise/optimized/coffee-table-book-100-years.webp" alt="" />
            </div>
          </article>
        </div>
      </section>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-brand" aria-label="JAANA identity">
            <img
              src={optimizedImageSrc("/assets/jaana-wordmark.png")}
              alt="JAANA wordmark"
              width="900"
              height="502"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <h1 className="hero-motto">
              <InlineEditableText
                editable={editable}
                value={homeCopy.heroMotto}
                onChange={(value) => onChangeHomeCopy?.("heroMotto", value)}
                className="hero-motto"
              />
            </h1>
          </div>
          <div className="hero-lead">
            <InlineEditableText
              editable={editable}
              value={homeCopy.heroLead}
              onChange={(value) => onChangeHomeCopy?.("heroLead", value)}
              multiline
              className="hero-lead"
            />
          </div>

          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => onActivateTab("causes")}>
              Browse causes
            </button>
            <button className="secondary-button" type="button" onClick={() => onActivateTab("connect")}>
              Open Connect 2026
            </button>
          </div>
        </div>

        <div className="hero-media">
          <button
            className="photo-button media-tile media-tile-main"
            type="button"
            onClick={() => onOpenLightboxImage(connectMoments[0])}
          >
            <img
              src={optimizedImageSrc(connectMoments[0].src)}
              alt={connectMoments[0].alt}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </button>
          <div className="media-stack">
            <button
              className="photo-button media-tile media-tile-small"
              type="button"
              onClick={() => onOpenLightboxImage(connectMoments[1])}
            >
              <img src={optimizedImageSrc(connectMoments[1].src)} alt={connectMoments[1].alt} loading="eager" decoding="async" />
            </button>
            <button
              className="photo-button media-tile media-tile-small"
              type="button"
              onClick={() => onOpenLightboxImage(connectMoments[2])}
            >
              <img src={optimizedImageSrc(connectMoments[2].src)} alt={connectMoments[2].alt} loading="eager" decoding="async" />
            </button>
          </div>
        </div>
      </section>

      <section id="home-panel" className="overview-shell" role="tabpanel" aria-label="Home">
        <div className="section-block">
          <div className="featured-heading">
            <div>
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.aboutTitle}
                  onChange={(value) => onChangeHomeCopy?.("aboutTitle", value)}
                  className="section-title-edit"
                />
              </h3>
            </div>
          </div>
          <article className="info-card">
            <div className="card-copy">
              <InlineEditableText
                editable={editable}
                value={homeCopy.aboutBody}
                onChange={(value) => onChangeHomeCopy?.("aboutBody", value)}
                multiline
                className="body-copy-edit"
              />
            </div>
          </article>
        </div>

        <div className="section-block">
          <div className="featured-heading">
            <div>
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.quickLinksTitle}
                  onChange={(value) => onChangeHomeCopy?.("quickLinksTitle", value)}
                  className="section-title-edit"
                />
              </h3>
            </div>
          </div>
          <div className="priority-grid">
            <article className="priority-card">
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.causesCardTitle}
                  onChange={(value) => onChangeHomeCopy?.("causesCardTitle", value)}
                />
              </h3>
              <div className="card-copy">
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.causesCardBody}
                  onChange={(value) => onChangeHomeCopy?.("causesCardBody", value)}
                  multiline
                />
              </div>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("causes")}>
                Open Causes page
              </button>
            </article>
            <article className="priority-card">
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.donateCardTitle}
                  onChange={(value) => onChangeHomeCopy?.("donateCardTitle", value)}
                />
              </h3>
              <div className="card-copy">
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.donateCardBody}
                  onChange={(value) => onChangeHomeCopy?.("donateCardBody", value)}
                  multiline
                />
              </div>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("donate")}>
                Open Donate page
              </button>
            </article>
            <article className="priority-card">
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.connectCardTitle}
                  onChange={(value) => onChangeHomeCopy?.("connectCardTitle", value)}
                />
              </h3>
              <div className="card-copy">
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.connectCardBody}
                  onChange={(value) => onChangeHomeCopy?.("connectCardBody", value)}
                  multiline
                />
              </div>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("connect")}>
                Open Connect page
              </button>
            </article>
          </div>
        </div>

        <div className="section-block">
          <div className="featured-heading">
            <div>
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.eventsTitle}
                  onChange={(value) => onChangeHomeCopy?.("eventsTitle", value)}
                  className="section-title-edit"
                />
              </h3>
            </div>
          </div>
          <div className="home-events-grid">
            <article className="event-card">
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.upcomingEventsTitle}
                  onChange={(value) => onChangeHomeCopy?.("upcomingEventsTitle", value)}
                />
              </h3>
              <div className="card-copy">
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.upcomingEventsBody}
                  onChange={(value) => onChangeHomeCopy?.("upcomingEventsBody", value)}
                  multiline
                />
              </div>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("connect")}>
                Open upcoming events
              </button>
            </article>
            <article className="event-card">
              <h3>
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.pastEventsTitle}
                  onChange={(value) => onChangeHomeCopy?.("pastEventsTitle", value)}
                />
              </h3>
              <div className="card-copy">
                <InlineEditableText
                  editable={editable}
                  value={homeCopy.pastEventsBody}
                  onChange={(value) => onChangeHomeCopy?.("pastEventsBody", value)}
                  multiline
                />
              </div>
              <button className="inline-button priority-link" type="button" onClick={onOpenPastEventsDialog}>
                Open past events
              </button>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
