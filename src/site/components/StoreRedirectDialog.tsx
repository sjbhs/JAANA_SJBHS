import { useEffect } from "react";
import { createPortal } from "react-dom";

type StoreRedirectDialogProps = {
  open: boolean;
  onClose: () => void;
};

const merchandiseStoreUrl = "/josephite-store";

export function StoreRedirectDialog({ open, onClose }: StoreRedirectDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="store-confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-redirect-title"
      aria-describedby="store-redirect-description"
      onClick={onClose}
    >
      <div className="store-confirm-dialog" onClick={(event) => event.stopPropagation()}>
        <p className="store-kicker">Opening store</p>
        <h2 id="store-redirect-title">Open JAANA Store?</h2>
        <p id="store-redirect-description">
          This will redirect you to the Josephite Store in a new tab. Your current page will stay open.
        </p>
        <div className="store-confirm-actions">
          <button className="secondary-button" type="button" onClick={onClose} autoFocus>
            Cancel
          </button>
          <a
            className="primary-button"
            href={merchandiseStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            Continue
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
