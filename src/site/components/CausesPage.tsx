import { CauseCard, CausesPageCopy, TabConfig } from "../types";
import { InlineEditableText } from "./InlineEditableText";

type CausesPageProps = {
  details: TabConfig;
  causeCards: CauseCard[];
  causesCopy: CausesPageCopy;
  onSelectCause: (cause: CauseCard, index: number) => void;
  editable?: boolean;
  onChangeDetails?: <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => void;
  onChangeCausesCopy?: <K extends keyof CausesPageCopy>(key: K, value: CausesPageCopy[K]) => void;
  onChangeCauseCard?: (index: number, key: "title" | "summary" | "minimum", value: string) => void;
  onDeleteCause?: (index: number) => void;
};

export function CausesPage({
  details,
  causeCards,
  causesCopy,
  onSelectCause,
  editable = false,
  onChangeDetails,
  onChangeCausesCopy,
  onChangeCauseCard,
  onDeleteCause
}: CausesPageProps) {
  return (
    <section id="causes-panel" className="subpage-shell donate-shell" role="tabpanel" aria-label="Causes">
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
        </div>
      </div>

      <section className="give-section">
        <div className="cause-list" aria-label="Cause list">
          {causeCards.map((cause, index) => (
            editable ? (
              <article className="cause-list-item is-editing" key={`${cause.title}-${index}`}>
                <div className="cause-list-copy">
                  <h3>
                    <InlineEditableText
                      editable={editable}
                      value={cause.title}
                      onChange={(value) => onChangeCauseCard?.(index, "title", value)}
                      className="section-title-edit"
                    />
                  </h3>
                  <div className="body-copy">
                    <InlineEditableText
                      editable={editable}
                      value={cause.summary}
                      onChange={(value) => onChangeCauseCard?.(index, "summary", value)}
                      multiline
                      className="body-copy-edit"
                    />
                  </div>
                </div>

                <div className="cause-list-meta">
                  <span>Minimum amount</span>
                  <strong>
                    <InlineEditableText
                      editable={editable}
                      value={cause.minimum}
                      onChange={(value) => onChangeCauseCard?.(index, "minimum", value)}
                      className="cause-minimum-edit"
                    />
                  </strong>
                  <div className="cause-admin-actions">
                    <button className="secondary-button" type="button" onClick={() => onSelectCause(cause, index)}>
                      Edit details
                    </button>
                    <button className="admin-danger-button" type="button" onClick={() => onDeleteCause?.(index)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <button className="cause-list-item" key={`${cause.title}-${index}`} type="button" onClick={() => onSelectCause(cause, index)}>
                <div className="cause-list-copy">
                  <h3>{cause.title}</h3>
                  <p>{cause.summary}</p>
                </div>

                <div className="cause-list-meta">
                  <span>Minimum amount</span>
                  <strong>{cause.minimum}</strong>
                </div>
              </button>
            )
          ))}
        </div>
      </section>
    </section>
  );
}
