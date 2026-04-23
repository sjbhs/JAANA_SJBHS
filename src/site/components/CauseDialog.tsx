import { useEffect } from "react";
import { CauseCard } from "../types";
import { PlaceholderDonateButton } from "./PlaceholderDonateButton";

type CauseDialogProps = {
  cause: CauseCard;
  onClose: () => void;
  onDonateClick: () => void;
  disableEscape?: boolean;
};

export function CauseDialog({ cause, onClose, onDonateClick, disableEscape = false }: CauseDialogProps) {
  const goal = cause.goal.replace(/^Goal:\s*/, "");
  const impact = cause.impact.replace(/^Impact:\s*/, "");

  useEffect(() => {
    if (disableEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disableEscape, onClose]);

  return (
    <div
      className="cause-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cause-dialog-title"
      aria-describedby="cause-dialog-description"
      onClick={onClose}
    >
      <div className="cause-dialog-shell" onClick={(event) => event.stopPropagation()}>
        <button className="cause-dialog-close" type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>

        <header className="cause-dialog-header">
          <h3 id="cause-dialog-title">{cause.title}</h3>
          <p id="cause-dialog-description">{cause.purpose}</p>
        </header>

        <div className="cause-dialog-grid">
          <aside className="cause-dialog-panel cause-dialog-summary-panel" aria-label="Funding details">
            <dl className="cause-dialog-summary-metrics">
              <div>
                <dt>Minimum amount</dt>
                <dd className="cause-dialog-minimum">{cause.minimum}</dd>
              </div>

              <div>
                <dt>Target</dt>
                <dd>{goal}</dd>
              </div>
            </dl>
          </aside>

          <article className="cause-dialog-panel cause-dialog-content-panel">
            <div className="cause-dialog-section">
              <h4>Impact</h4>
              <p>{impact}</p>
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

        <footer className="cause-dialog-actions">
          <PlaceholderDonateButton buttonClassName="primary-button" onClick={onDonateClick} />
        </footer>
      </div>
    </div>
  );
}
