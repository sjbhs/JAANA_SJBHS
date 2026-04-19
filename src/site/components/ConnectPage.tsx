import { AlbumFolder, SecondaryPage, TabConfig } from "../types";

type ConnectPageProps = {
  details: TabConfig;
  connectPlaceholders: SecondaryPage[];
  groupedEventAlbums: AlbumFolder[];
  onOpenAlbumFolder: (folder: AlbumFolder) => void;
};

export function ConnectPage({
  details,
  connectPlaceholders,
  groupedEventAlbums,
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
          <img src="/assets/oba-connect-mark.png" alt="SJBHS OBA Connect mark" />
          <strong>Save the Date</strong>
          <p>North America Connect 2026</p>
          <div className="event-poster-meta">
            <span>Washington, D.C. metro area</span>
            <span>Saturday Dinner</span>
            <span>Sunday Picnic Lunch</span>
            <span>September 19-20, 2026</span>
          </div>
        </aside>
      </div>

      <div className="section-block">
        <div className="connect-sponsor-callout">
          <div>
            <span className="section-kicker">Call to Sponsors</span>
            <h3>Support North America Connect 2026.</h3>
            <p>
              We are seeking sponsors for our North America Connect reunion, your brand/business will have the
              opportunity to reach hundreds of successful Josephites and their families. Proceeds from the event will
              fund the OBA Teachers Insurance program. Individual and batch benefactors are also warmly welcome. More
              info in the document{" "}
              <a
                className="inline-link"
                href="/docs/north-america-connect-2026-call-for-sponsors.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Download Call to Sponsors PDF
              </a>
              .
            </p>
          </div>

        </div>
      </div>

      <div className="section-block">
        <div className="featured-heading">
          <div>
            <h3>Save the date for the North America Connect 2026 weekend.</h3>
            <p>Saturday Dinner and Sunday Picnic Lunch will take place September 19-20, 2026.</p>
          </div>
        </div>

        <div className="event-highlight-grid">
          <article className="story-card event-card">
            <span>September 19, 2026</span>
            <h3>Saturday Dinner</h3>
            <p>Alumni and families will gather in the Washington, D.C. metro area.</p>
          </article>

          <article className="story-card event-card">
            <span>September 20, 2026</span>
            <h3>Sunday Picnic Lunch</h3>
            <p>The reunion weekend continues with a family-friendly picnic lunch.</p>
          </article>
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
