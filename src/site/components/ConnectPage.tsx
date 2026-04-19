import { useEffect, useState } from "react";
import { AlbumFolder, SecondaryPage, TabConfig } from "../types";

const CONNECT_EDITOR_STORAGE_KEY = "jaana-connect-page-local-v1";

const defaultSponsorMessage =
  "We are seeking sponsors for our North America Connect reunion, your brand/business will have the opportunity to reach hundreds of successful Josephites and their families. Proceeds from the event will fund the OBA Teachers Insurance program. Individual and batch benefactors are also warmly welcome.";

type ConnectPageProps = {
  details: TabConfig;
  connectPlaceholders: SecondaryPage[];
  groupedEventAlbums: AlbumFolder[];
  onOpenAlbumFolder: (folder: AlbumFolder) => void;
};

type ConnectEditableContent = {
  sponsorMessage: string;
  placeholders: SecondaryPage[];
};

const createDefaultEditableContent = (connectPlaceholders: SecondaryPage[]): ConnectEditableContent => ({
  sponsorMessage: defaultSponsorMessage,
  placeholders: connectPlaceholders
});

export function ConnectPage({
  details,
  connectPlaceholders,
  groupedEventAlbums,
  onOpenAlbumFolder
}: ConnectPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeScheduleTab, setActiveScheduleTab] = useState(0);
  const [saveNote, setSaveNote] = useState("Local edits affect only this browser.");
  const [editableContent, setEditableContent] = useState<ConnectEditableContent>(
    createDefaultEditableContent(connectPlaceholders)
  );

  useEffect(() => {
    const fallback = createDefaultEditableContent(connectPlaceholders);
    const raw = window.localStorage.getItem(CONNECT_EDITOR_STORAGE_KEY);

    if (!raw) {
      setEditableContent(fallback);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ConnectEditableContent>;
      const parsedPlaceholders = Array.isArray(parsed.placeholders) ? parsed.placeholders : fallback.placeholders;

      setEditableContent({
        sponsorMessage:
          typeof parsed.sponsorMessage === "string" && parsed.sponsorMessage.trim()
            ? parsed.sponsorMessage
            : fallback.sponsorMessage,
        placeholders: parsedPlaceholders.map((item, index) => ({
          title:
            typeof item?.title === "string" && item.title.trim()
              ? item.title
              : fallback.placeholders[index]?.title ?? "Details",
          body:
            typeof item?.body === "string" && item.body.trim()
              ? item.body
              : fallback.placeholders[index]?.body ?? "Details coming soon."
        }))
      });
    } catch {
      setEditableContent(fallback);
    }
  }, [connectPlaceholders]);

  useEffect(() => {
    setActiveScheduleTab((current) => Math.min(current, Math.max(editableContent.placeholders.length - 1, 0)));
  }, [editableContent.placeholders.length]);

  const updatePlaceholder = (index: number, field: keyof SecondaryPage, value: string) => {
    setEditableContent((current) => ({
      ...current,
      placeholders: current.placeholders.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const saveLocally = () => {
    window.localStorage.setItem(CONNECT_EDITOR_STORAGE_KEY, JSON.stringify(editableContent));
    setSaveNote("Saved locally on this browser.");
  };

  const resetLocalEdits = () => {
    window.localStorage.removeItem(CONNECT_EDITOR_STORAGE_KEY);
    setEditableContent(createDefaultEditableContent(connectPlaceholders));
    setSaveNote("Local edits cleared. Defaults restored.");
  };

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

      <div className="connect-editor-toolbar">
        <button
          className={isEditing ? "secondary-button" : "primary-button"}
          type="button"
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing ? "Done editing" : "Edit this page"}
        </button>

        {isEditing ? (
          <>
            <button className="primary-button" type="button" onClick={saveLocally}>
              Save locally
            </button>
            <button className="secondary-button" type="button" onClick={resetLocalEdits}>
              Reset local edits
            </button>
          </>
        ) : null}

        <span className="connect-editor-note">{saveNote}</span>
      </div>

      <div className="section-block">
        <div className="connect-sponsor-callout">
          <div>
            <span className="section-kicker">Call to Sponsors</span>
            <h3>Support North America Connect 2026.</h3>
            {isEditing ? (
              <textarea
                className="connect-edit-textarea"
                value={editableContent.sponsorMessage}
                onChange={(event) =>
                  setEditableContent((current) => ({
                    ...current,
                    sponsorMessage: event.target.value
                  }))
                }
              />
            ) : (
              <p>
                {editableContent.sponsorMessage} More info in the document{" "}
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
            )}
          </div>

        </div>
      </div>

      <div className="section-block">
        <div className="connect-schedule-shell">
          <div className="featured-heading">
            <div>
              <h3>Save the date for the North America Connect 2026 weekend.</h3>
              <p>Takes place September 19-20, 2026.</p>
            </div>
          </div>

          <div className="connect-schedule-tabs" role="tablist" aria-label="Connect details tabs">
            {editableContent.placeholders.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={activeScheduleTab === index}
                className={`connect-schedule-tab ${activeScheduleTab === index ? "is-active" : ""}`}
                onClick={() => setActiveScheduleTab(index)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="connect-schedule-panel" role="tabpanel">
            {isEditing ? (
              <>
                <input
                  className="connect-edit-input"
                  value={editableContent.placeholders[activeScheduleTab]?.title ?? ""}
                  onChange={(event) => updatePlaceholder(activeScheduleTab, "title", event.target.value)}
                />
                <textarea
                  className="connect-edit-textarea"
                  value={editableContent.placeholders[activeScheduleTab]?.body ?? ""}
                  onChange={(event) => updatePlaceholder(activeScheduleTab, "body", event.target.value)}
                />
              </>
            ) : (
              <>
                <h4>{editableContent.placeholders[activeScheduleTab]?.title}</h4>
                <p>{editableContent.placeholders[activeScheduleTab]?.body}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="section-block">
        <div className="featured-heading">
          <div>
            <h3>OBA past event</h3>
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
