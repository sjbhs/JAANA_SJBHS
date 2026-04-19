import { AlbumFolder, EventHighlight, GalleryImage, SecondaryPage, SponsorTier, TabConfig } from "../types";

type ConnectPageProps = {
  details: TabConfig;
  sponsorHighlights: EventHighlight[];
  sponsorTiers: SponsorTier[];
  sponsorMaterials: GalleryImage[];
  connectPlaceholders: SecondaryPage[];
  groupedEventAlbums: AlbumFolder[];
  onOpenLightboxImage: (image: GalleryImage) => void;
  onOpenAlbumFolder: (folder: AlbumFolder) => void;
};

export function ConnectPage({
  details,
  sponsorHighlights,
  sponsorTiers,
  sponsorMaterials,
  connectPlaceholders,
  groupedEventAlbums,
  onOpenLightboxImage,
  onOpenAlbumFolder
}: ConnectPageProps) {
  return (
    <section id="connect-panel" className="subpage-shell" role="tabpanel" aria-label="North America Connect 2026">
      <div className="subpage-hero">
        <div className="subpage-copy">
          <span className="section-kicker">{details.kicker}</span>
          <h2>{details.title}</h2>
          <p>{details.copy}</p>
        </div>

        <aside className="event-poster">
          <strong>North America Connect 2026</strong>
          <p>Washington, D.C. metro area</p>
          <div className="event-poster-meta">
            <span>Saturday Dinner</span>
            <span>Sunday Picnic Lunch</span>
            <span>September 19-20, 2026</span>
          </div>
          <div className="process-actions">
            <a className="inline-link event-link" href="/docs/north-america-connect-2026-call-for-sponsors.pdf" target="_blank" rel="noreferrer">
              Download sponsor packet
            </a>
            <a
              className="inline-link event-link"
              href="mailto:jaanafinance@gmail.com?subject=North%20America%20Connect%202026%20Sponsorship"
            >
              Contact sponsors team
            </a>
          </div>
        </aside>
      </div>

      <div className="event-highlight-grid">
        {sponsorHighlights.map((item) => (
          <article className="story-card event-card" key={item.title}>
            <span>{item.title}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="section-block">
        <div className="featured-heading">
          <div>
            <h3>Sponsorship options are already defined and ready to discuss.</h3>
          </div>
        </div>

        <div className="support-grid donate-grid">
          {sponsorTiers.map((tier) => (
            <article className="support-card sponsor-tier-card" key={tier.title}>
              <p className="support-note">{tier.amount}</p>
              <h3>{tier.title}</h3>
              <ul className="detail-list">
                {tier.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="section-block">
        <div className="featured-heading">
          <div>
            <h3>The sponsor packet is available here for quick review and sharing.</h3>
          </div>
        </div>

        <div className="featured-photo-strip sponsor-material-grid">
          {sponsorMaterials.map((material) => (
            <button
              className="featured-photo sponsor-material"
              key={material.src}
              type="button"
              onClick={() => onOpenLightboxImage(material)}
            >
              <img src={material.src} alt={material.alt} />
              <span>{material.caption}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section-block">
        <div className="featured-heading">
          <div>
            <h3>Tickets, venue details, and the weekend schedule will follow here.</h3>
          </div>
        </div>

        <div className="support-grid donate-grid">
          {connectPlaceholders.map((item) => (
            <article className="support-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="section-block">
        <div className="featured-heading">
          <div>
            <h3>Browse past events by theme, then open a set to view the photos.</h3>
          </div>
        </div>

        <div className="folder-grid album-folder-grid" aria-label="Album folders">
          {groupedEventAlbums.map((folder) => (
            <button className="folder-card" key={folder.id} type="button" onClick={() => onOpenAlbumFolder(folder)}>
              <div className="folder-card-thumb">
                <img src={folder.albums[0]?.cover.src} alt={folder.albums[0]?.cover.alt ?? folder.title} />
              </div>

              <div className="folder-card-copy">
                <span>{folder.title}</span>
                <h3>{folder.title}</h3>
                <p>{folder.albums.length} event sets</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
