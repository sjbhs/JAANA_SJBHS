import { CauseCard } from "../types";
import { PlaceholderDonateButton } from "./PlaceholderDonateButton";

type CauseDialogProps = {
  cause: CauseCard;
  onClose: () => void;
};

export function CauseDialog({ cause, onClose }: CauseDialogProps) {
  return (
    <div className="cause-dialog" role="dialog" aria-modal="true" aria-labelledby="cause-dialog-title" onClick={onClose}>
      <div className="cause-dialog-shell" onClick={(event) => event.stopPropagation()}>
        <button className="cause-dialog-close" type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>

        <div className="cause-dialog-header">
          <h3 id="cause-dialog-title">{cause.title}</h3>
          <p>{cause.purpose}</p>
        </div>

        <div className="cause-dialog-grid">
          <article className="cause-dialog-panel cause-dialog-summary-panel">
            <div className="cause-dialog-summary-header">
              <h4>Funding details</h4>
            </div>

            <div className="cause-dialog-summary-metrics">
              <div className="cause-dialog-summary-item">
                <span>Minimum amount</span>
                <strong>{cause.minimum}</strong>
              </div>

              <div className="cause-dialog-summary-item">
                <span>Target</span>
                <p className="cause-dialog-target-text">{cause.goal.replace(/^Goal:\s*/, "")}</p>
              </div>
            </div>
          </article>

          <article className="cause-dialog-panel cause-dialog-content-panel">
            <div className="cause-dialog-section">
              <h4>Impact</h4>
              <p>{cause.impact.replace(/^Impact:\s*/, "")}</p>
            </div>

            <div className="cause-dialog-section">
              <h4>Where support can go</h4>
              <ul className="detail-list">
                {cause.support.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>

        <div className="cause-dialog-actions">
          <PlaceholderDonateButton buttonClassName="primary-button" />
        </div>
      </div>
    </div>
  );
}
