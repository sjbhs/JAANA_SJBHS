import { useEffect, useState } from "react";
import { ConnectPageContent, ConnectPageCopy, TabConfig } from "../types";
import { InlineEditableText } from "./InlineEditableText";

type ConnectPageProps = {
  details: TabConfig;
  connectContent: ConnectPageContent;
  connectCopy: ConnectPageCopy;
  editable?: boolean;
  onChangeDetails?: <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => void;
  onChangeConnectCopy?: <K extends keyof ConnectPageCopy>(key: K, value: ConnectPageCopy[K]) => void;
  onChangeConnectContent?: <K extends keyof ConnectPageContent>(key: K, value: ConnectPageContent[K]) => void;
};

export function ConnectPage({
  details,
  connectContent,
  connectCopy,
  editable = false,
  onChangeDetails,
  onChangeConnectCopy,
  onChangeConnectContent
}: ConnectPageProps) {
  const [activeScheduleTab, setActiveScheduleTab] = useState(0);

  useEffect(() => {
    setActiveScheduleTab((current) => Math.min(current, Math.max(connectContent.placeholders.length - 1, 0)));
  }, [connectContent.placeholders.length]);

  return (
    <section id="connect-panel" className="subpage-shell" role="tabpanel" aria-label="North America Connect 2026">
      <div className="subpage-hero">
        <div className="subpage-copy">
          <span className="section-kicker">{details.kicker}</span>
          <h2>
            <InlineEditableText
              editable={editable}
              value={details.title}
              onChange={(value) => onChangeDetails?.("title", value)}
              className="section-title-edit"
            />
          </h2>
          <div className="body-copy">
            <InlineEditableText
              editable={editable}
              value={details.copy}
              onChange={(value) => onChangeDetails?.("copy", value)}
              multiline
              className="body-copy-edit"
            />
          </div>
        </div>

        <aside className="event-poster">
          <img src="/assets/oba-connect-mark.png" alt="SJBHS OBA Connect mark" />
          <strong>
            <InlineEditableText
              editable={editable}
              value={connectCopy.posterLabel}
              onChange={(value) => onChangeConnectCopy?.("posterLabel", value)}
              className="section-title-edit"
            />
          </strong>
          <p>
            <InlineEditableText
              editable={editable}
              value={connectCopy.posterTitle}
              onChange={(value) => onChangeConnectCopy?.("posterTitle", value)}
              className="section-title-edit"
            />
          </p>
          <div className="event-poster-meta">
            {editable ? (
              <InlineEditableText
                editable
                value={connectCopy.posterBody}
                onChange={(value) => onChangeConnectCopy?.("posterBody", value)}
                className="body-copy-edit"
              />
            ) : (
              connectCopy.posterBody.split("|").map((item) => <span key={item.trim()}>{item.trim()}</span>)
            )}
          </div>
        </aside>
      </div>

      <div className="section-block">
        <div className="connect-sponsor-callout">
          <div>
            <span className="section-kicker">Call to Sponsors</span>
            <h3>
              <InlineEditableText
                editable={editable}
                value={connectCopy.sponsorHeading}
                onChange={(value) => onChangeConnectCopy?.("sponsorHeading", value)}
                className="section-title-edit"
              />
            </h3>
            <div className="body-copy">
              {editable ? (
                <InlineEditableText
                  editable
                  value={connectContent.sponsorMessage || connectCopy.sponsorBody}
                  onChange={(value) => onChangeConnectContent?.("sponsorMessage", value)}
                  multiline
                  className="body-copy-edit"
                />
              ) : (
                <>
                  {(connectContent.sponsorMessage || connectCopy.sponsorBody).trim()} More info in the document{" "}
                  <a
                    className="inline-link"
                    href="/docs/north-america-connect-2026-call-for-sponsors.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Call to Sponsors PDF
                  </a>
                  .
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section-block">
        <div className="connect-schedule-shell">
          <div className="featured-heading">
            <div>
              <h3>
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
                  className="body-copy-edit"
                />
              </div>
            </div>
          </div>

          <div className="connect-schedule-tabs" role="tablist" aria-label="Connect details tabs">
            {connectContent.placeholders.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
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
            <h4>
              <InlineEditableText
                editable={editable}
                value={connectContent.placeholders[activeScheduleTab]?.title ?? ""}
                onChange={(value) =>
                  onChangeConnectContent?.("placeholders", connectContent.placeholders.map((item, index) =>
                    index === activeScheduleTab ? { ...item, title: value } : item
                  ))
                }
                className="section-title-edit"
              />
            </h4>
            <div className="body-copy">
              <InlineEditableText
                editable={editable}
                value={connectContent.placeholders[activeScheduleTab]?.body ?? ""}
                onChange={(value) =>
                  onChangeConnectContent?.("placeholders", connectContent.placeholders.map((item, index) =>
                    index === activeScheduleTab ? { ...item, body: value } : item
                  ))
                }
                multiline
                className="body-copy-edit"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
