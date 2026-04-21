import { useEffect, useState } from "react";
import { ConnectPageContent, TabConfig } from "../types";

type ConnectPageProps = {
  details: TabConfig;
  connectContent: ConnectPageContent;
};

export function ConnectPage({ details, connectContent }: ConnectPageProps) {
  const [activeScheduleTab, setActiveScheduleTab] = useState(0);

  useEffect(() => {
    setActiveScheduleTab((current) => Math.min(current, Math.max(connectContent.placeholders.length - 1, 0)));
  }, [connectContent.placeholders.length]);

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
              {connectContent.sponsorMessage} More info in the document{" "}
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
        <div className="connect-schedule-shell">
          <div className="featured-heading">
            <div>
              <h3>Save the date for the North America Connect 2026 weekend.</h3>
              <p>Takes place September 19-20, 2026.</p>
            </div>
          </div>

          <div className="connect-schedule-tabs" role="tablist" aria-label="Connect details tabs">
            {connectContent.placeholders.map((item, index) => (
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
            <h4>{connectContent.placeholders[activeScheduleTab]?.title}</h4>
            <p>{connectContent.placeholders[activeScheduleTab]?.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
