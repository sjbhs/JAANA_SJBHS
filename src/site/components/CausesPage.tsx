import { CauseCard, TabConfig } from "../types";

type CausesPageProps = {
  details: TabConfig;
  causeCards: CauseCard[];
  onSelectCause: (cause: CauseCard) => void;
};

export function CausesPage({ details, causeCards, onSelectCause }: CausesPageProps) {
  return (
    <section id="causes-panel" className="subpage-shell donate-shell" role="tabpanel" aria-label="Causes">
      <div className="donation-page-header">
        <div className="donation-page-copy">
          <h2>{details.title}</h2>
          {details.copy ? <p>{details.copy}</p> : null}
        </div>
      </div>

      <section className="give-section">
        <div className="give-section-head">
          <h3>Choose where your support goes</h3>
        </div>

        <div className="cause-list" aria-label="Cause list">
          {causeCards.map((cause) => (
            <button className="cause-list-item" key={cause.title} type="button" onClick={() => onSelectCause(cause)}>
              <div className="cause-list-copy">
                <h3>{cause.title}</h3>
                <p>{cause.summary}</p>
              </div>

              <div className="cause-list-meta">
                <span>Minimum amount</span>
                <strong>{cause.minimum}</strong>
              </div>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
