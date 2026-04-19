import { GalleryImage, PriorityCard, SecondaryPage, TabId } from "../types";

type HomePageProps = {
  impactStats: { value: string; label: string }[];
  priorityCards: PriorityCard[];
  secondaryPages: SecondaryPage[];
  connectMoments: GalleryImage[];
  onActivateTab: (tabId: TabId) => void;
  onOpenLightboxImage: (image: GalleryImage) => void;
};

export function HomePage({
  impactStats,
  priorityCards,
  secondaryPages,
  connectMoments,
  onActivateTab,
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
            Support students, teachers, and the wider SJBHS community through JAANA, and stay connected through the
            next major North America alumni gathering.
          </p>

          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => onActivateTab("causes")}>
              Browse causes
            </button>
            <button className="secondary-button" type="button" onClick={() => onActivateTab("connect")}>
              See Connect 2026
            </button>
          </div>

          <div className="impact-strip" aria-label="Priority highlights">
            {impactStats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-media">
          <button
            className="photo-button media-tile media-tile-main"
            type="button"
            onClick={() => onOpenLightboxImage(connectMoments[0])}
          >
            <img src={connectMoments[0].src} alt="" />
          </button>
          <div className="media-stack">
            <button
              className="photo-button media-tile media-tile-small"
              type="button"
              onClick={() => onOpenLightboxImage(connectMoments[1])}
            >
              <img src={connectMoments[1].src} alt="" />
            </button>
            <button
              className="photo-button media-tile media-tile-small"
              type="button"
              onClick={() => onOpenLightboxImage(connectMoments[2])}
            >
              <img src={connectMoments[2].src} alt="" />
            </button>
          </div>
        </div>
      </section>

      <section id="home-panel" className="overview-shell" role="tabpanel" aria-label="Home">
        <div className="featured-heading priority-heading">
          <div>
            <h3>Three clear paths make it easy to act.</h3>
          </div>
        </div>

        <div className="priority-grid">
          {priorityCards.map((card) => (
            <article className="priority-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <ul className="detail-list">
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button className="inline-button priority-link" type="button" onClick={() => onActivateTab(card.tab)}>
                {card.cta}
              </button>
            </article>
          ))}
        </div>

        <div className="secondary-pages-card">
          <div className="featured-heading">
            <div>
              <h3>Additional pages can keep supporting the story as the core experience grows.</h3>
            </div>
          </div>

          <div className="secondary-page-grid">
            {secondaryPages.map((page) => (
              <article className="secondary-page-card" key={page.title}>
                <h3>{page.title}</h3>
                <p>{page.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="school-banner-card">
          <img src="/assets/sjbhs-main-banner.jpg" alt="St. Joseph's Boys' High School campus banner" />
          <div className="school-banner-copy">
            <h3>Every path on the site leads back to the school and its people.</h3>
            <p>
              The Causes page shows where support can go, the Donate page will soon include online giving links, and
              North America Connect 2026 brings alumni and families together around a shared purpose.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
