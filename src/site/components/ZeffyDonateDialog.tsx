import { useEffect, useRef } from "react";

type ZeffyDonateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ZEFFY_FORM_URL = "/embed/donation-form/jaana-donate-to-sjbhs-oba-bjes-causes";
const ZEFFY_IFRAME_URL = "https://www.zeffy.com/embed/donation-form/jaana-donate-to-sjbhs-oba-bjes-causes";
const ZEFFY_SCRIPT_SRC = "https://www.zeffy.com/embed/v2/zeffy-embed.js";

export function ZeffyDonateDialog({ open, onClose }: ZeffyDonateDialogProps) {
  const embedRootRef = useRef<HTMLDivElement | null>(null);

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
  }, [open, onClose]);

  useEffect(() => {
    const embedRoot = embedRootRef.current;

    if (!open || !embedRoot) {
      return;
    }

    embedRoot.innerHTML = `
      <div data-zeffy-embed data-form-url="${ZEFFY_FORM_URL}"></div>
      <div data-zeffy-embed-fallback style="display:none;">
        <div style="position:relative;overflow:hidden;height:450px;width:100%;">
          <iframe
            title="Donation form powered by Zeffy"
            style="position:absolute;border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%"
            src="${ZEFFY_IFRAME_URL}"
            allowpaymentrequest
            allowTransparency="true"
          ></iframe>
        </div>
      </div>
    `;

    const script = document.createElement("script");
    script.src = ZEFFY_SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      const fallback = embedRoot.querySelector<HTMLElement>("[data-zeffy-embed-fallback]");

      if (fallback) {
        fallback.style.display = "block";
      }
    };

    embedRoot.appendChild(script);

    return () => {
      script.remove();
      embedRoot.innerHTML = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="zeffy-dialog" role="dialog" aria-modal="true" aria-labelledby="zeffy-dialog-title" onClick={onClose}>
      <div className="zeffy-dialog-shell" onClick={(event) => event.stopPropagation()} tabIndex={-1} autoFocus>
        <header className="zeffy-dialog-header">
          <button className="zeffy-dialog-close" type="button" onClick={onClose} aria-label="Close donation form">
            ×
          </button>
          <p className="support-note">Secure donation form powered by Zeffy</p>
          <h3 id="zeffy-dialog-title">Donate to JAANA causes</h3>
          <p>
            Donate to JAANA, SJBHS-OBA, and BJES causes such as scholarships, awards, meals, insurance, and
            infrastructure.
          </p>
          <p>
            <strong>Grant:</strong> $1,000 or more. Donors may specify the cause they want to support.
          </p>
          <p>
            <strong>Small gifts:</strong> Any amount helps. JAANA and SJBHS OBA use these funds where needed most.
          </p>
        </header>

        <div className="zeffy-dialog-embed" ref={embedRootRef} />
      </div>
    </div>
  );
}
