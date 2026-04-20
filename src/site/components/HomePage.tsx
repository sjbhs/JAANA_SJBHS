import { GalleryImage, TabId } from "../types";

type HomePageProps = {
  connectMoments: GalleryImage[];
  onActivateTab: (tabId: TabId) => void;
  onOpenPastEventsDialog: () => void;
  onOpenLightboxImage: (image: GalleryImage) => void;
};

export function HomePage({
  connectMoments,
  onActivateTab,
  onOpenPastEventsDialog,
  onOpenLightboxImage
}: HomePageProps) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-brand" aria-label="JAANA identity">
            <img src="/assets/jaana-wordmark.png" alt="JAANA wordmark" />
            <h1 className="hero-motto">Fide et Labore.</h1>
          </div>
          <p className="hero-lead">
            JAANA supports St. Joseph&apos;s Boys&apos; High School through alumni-led service, giving, and community
            events across North America.
          </p>

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
            <img src={connectMoments[0].src} alt={connectMoments[0].alt} />
          </button>
          <div className="media-stack">
            <button
              className="photo-button media-tile media-tile-small"
              type="button"
              onClick={() => onOpenLightboxImage(connectMoments[1])}
            >
              <img src={connectMoments[1].src} alt={connectMoments[1].alt} />
            </button>
            <button
              className="photo-button media-tile media-tile-small"
              type="button"
              onClick={() => onOpenLightboxImage(connectMoments[2])}
            >
              <img src={connectMoments[2].src} alt={connectMoments[2].alt} />
            </button>
          </div>
        </div>
      </section>

      <section id="home-panel" className="overview-shell" role="tabpanel" aria-label="Home">
        <div className="section-block">
          <div className="featured-heading">
            <div>
              <h3>About JAANA</h3>
            </div>
          </div>
          <article className="info-card">
            <p>
              The Josephite Alumni Association of North America brings together SJBHS alumni and families to support
              scholarships, teacher welfare, student programmes, and school development through trusted giving and
              active fellowship.
            </p>
          </article>
        </div>

        <div className="section-block">
          <div className="featured-heading">
            <div>
              <h3>Quick links</h3>
            </div>
          </div>
          <div className="priority-grid">
            <article className="priority-card">
              <h3>Causes</h3>
              <p>Review the active school causes and decide where you want your support to go.</p>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("causes")}>
                Open Causes page
              </button>
            </article>
            <article className="priority-card">
              <h3>Donate</h3>
              <p>Find current donation guidance and contact points while online giving links are being finalized.</p>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("donate")}>
                Open Donate page
              </button>
            </article>
            <article className="priority-card">
              <h3>North America Connect 2026</h3>
              <p>Check sponsor details and reunion updates for the September 2026 weekend.</p>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("connect")}>
                Open Connect page
              </button>
            </article>
          </div>
        </div>

        <div className="section-block">
          <div className="featured-heading">
            <div>
              <h3>Upcoming JAANA events | Past JAANA events</h3>
            </div>
          </div>
          <div className="home-events-grid">
            <article className="event-card">
              <h3>Upcoming JAANA events</h3>
              <p>North America Connect 2026 | September 19-20, 2026 | Washington DC &amp; Northern Virginia.</p>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab("connect")}>
                Open upcoming events
              </button>
            </article>
            <article className="event-card">
              <h3>Past JAANA events</h3>
              <p>Browse past OBA and Connect event albums in a dialog view.</p>
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
