import { MutableRefObject, RefObject } from "react";
import { GalleryImage } from "../types";

type LightboxDialogProps = {
  image: GalleryImage;
  zoomed: boolean;
  dragging: boolean;
  pinching: boolean;
  wheeling: boolean;
  scale: number;
  pan: { x: number; y: number };
  baseSize: { width: number; height: number } | null;
  lightboxScaleRef: MutableRefObject<number>;
  lightboxPanRef: MutableRefObject<{ x: number; y: number }>;
  wheelStopTimeoutRef: MutableRefObject<number | null>;
  pinchDistanceRef: MutableRefObject<number | null>;
  pinchScaleRef: MutableRefObject<number>;
  pinchMovedRef: MutableRefObject<boolean>;
  pinchFrameRef: MutableRefObject<number | null>;
  pinchPendingScaleRef: MutableRefObject<number | null>;
  pinchPendingAnchorRef: MutableRefObject<{ clientX: number; clientY: number } | null>;
  dragMovedRef: MutableRefObject<boolean>;
  lightboxDragRef: MutableRefObject<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>;
  lightboxMediaRef: RefObject<HTMLDivElement>;
  lightboxFrameRef: RefObject<HTMLDivElement>;
  lightboxImageRef: RefObject<HTMLImageElement>;
  onClose: () => void;
  onToggleZoom: (anchor?: { clientX: number; clientY: number }) => void;
  onSetWheeling: (value: boolean) => void;
  onSetPinching: (value: boolean) => void;
  onSetDragging: (value: boolean) => void;
  onSetPanState: (nextPan: { x: number; y: number }, scale?: number, baseSize?: { width: number; height: number } | null) => void;
  onScheduleWheelScale: (nextScale: number, anchor: { clientX: number; clientY: number }) => void;
  onSchedulePinchScale: (nextScale: number, anchor: { clientX: number; clientY: number }) => void;
  onUpdateBaseSize: (image: HTMLImageElement) => void;
  onStopDrag: () => void;
};

export function LightboxDialog({
  image,
  zoomed,
  dragging,
  pinching,
  wheeling,
  scale,
  pan,
  baseSize,
  lightboxScaleRef,
  lightboxPanRef,
  wheelStopTimeoutRef,
  pinchDistanceRef,
  pinchScaleRef,
  pinchMovedRef,
  pinchFrameRef,
  pinchPendingScaleRef,
  pinchPendingAnchorRef,
  dragMovedRef,
  lightboxDragRef,
  lightboxMediaRef,
  lightboxFrameRef,
  lightboxImageRef,
  onClose,
  onToggleZoom,
  onSetWheeling,
  onSetPinching,
  onSetDragging,
  onSetPanState,
  onScheduleWheelScale,
  onSchedulePinchScale,
  onUpdateBaseSize,
  onStopDrag
}: LightboxDialogProps) {
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={image.caption} onClick={onClose}>
      <div className="lightbox-shell" onClick={onClose} tabIndex={-1} autoFocus>
        <div className="lightbox-topbar">
          <button
            className={`lightbox-zoom${zoomed ? " is-active" : ""}`}
            type="button"
            aria-label={zoomed ? "Return image to fit view" : "Enable image zoom"}
            aria-pressed={zoomed}
            onClick={(event) => {
              event.stopPropagation();
              onToggleZoom();
            }}
          >
            <span className="lightbox-zoom-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="10.5" cy="10.5" r="5.5" />
                <path d="M15 15l5 5" />
                {zoomed ? <path d="M8 10.5h5" /> : <path d="M10.5 8v5M8 10.5h5" />}
              </svg>
            </span>
            <span>{zoomed ? "Fit" : "Zoom"}</span>
          </button>
          <button
            className="lightbox-close"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
          >
            Close
          </button>
        </div>
        <div
          ref={lightboxMediaRef}
          className={`lightbox-media${zoomed ? " is-zoomed" : ""}`}
          onWheel={(event) => {
            if (event.ctrlKey) {
              event.preventDefault();
              onSetWheeling(true);

              if (wheelStopTimeoutRef.current !== null) {
                window.clearTimeout(wheelStopTimeoutRef.current);
              }

              wheelStopTimeoutRef.current = window.setTimeout(() => {
                onSetWheeling(false);
                wheelStopTimeoutRef.current = null;
              }, 80);

              const deltaMultiplier = event.deltaMode === 1 ? 15 : event.deltaMode === 2 ? window.innerHeight : 1;
              const rawDelta = event.deltaY * deltaMultiplier;
              const normalizedDelta = Math.max(-44, Math.min(44, rawDelta));
              const zoomFactor = Math.exp(-normalizedDelta * 0.00108);
              const nextScale = lightboxScaleRef.current * zoomFactor;

              onScheduleWheelScale(nextScale, { clientX: event.clientX, clientY: event.clientY });
              return;
            }

            if (!zoomed) {
              return;
            }

            event.preventDefault();
            onSetPanState(
              {
                x: lightboxPanRef.current.x - event.deltaX * 1.8,
                y: lightboxPanRef.current.y - event.deltaY * 1.8
              },
              lightboxScaleRef.current
            );
          }}
          onTouchStart={(event) => {
            if (!zoomed || event.touches.length !== 2) {
              return;
            }

            onSetPinching(true);
            pinchMovedRef.current = false;
            const [firstTouch, secondTouch] = Array.from(event.touches);
            pinchDistanceRef.current = Math.hypot(
              secondTouch.clientX - firstTouch.clientX,
              secondTouch.clientY - firstTouch.clientY
            );
            pinchScaleRef.current = scale;
          }}
          onTouchMove={(event) => {
            if (!zoomed || event.touches.length !== 2 || pinchDistanceRef.current === null) {
              return;
            }

            event.preventDefault();
            const [firstTouch, secondTouch] = Array.from(event.touches);
            const nextDistance = Math.hypot(
              secondTouch.clientX - firstTouch.clientX,
              secondTouch.clientY - firstTouch.clientY
            );

            const distanceRatio = nextDistance / pinchDistanceRef.current;
            const pinchCenterX = (firstTouch.clientX + secondTouch.clientX) / 2;
            const pinchCenterY = (firstTouch.clientY + secondTouch.clientY) / 2;
            const dampedRatio = Math.pow(distanceRatio, 0.82);
            pinchMovedRef.current = true;
            onSchedulePinchScale(pinchScaleRef.current * dampedRatio, {
              clientX: pinchCenterX,
              clientY: pinchCenterY
            });
          }}
          onTouchEnd={() => {
            if (pinchDistanceRef.current === null) {
              return;
            }

            pinchDistanceRef.current = null;
            pinchScaleRef.current = scale;
            onSetPinching(false);
            window.setTimeout(() => {
              pinchMovedRef.current = false;
            }, 160);
          }}
          onTouchCancel={() => {
            pinchDistanceRef.current = null;
            onSetPinching(false);
            pinchPendingScaleRef.current = null;
            pinchPendingAnchorRef.current = null;

            if (pinchFrameRef.current !== null) {
              window.cancelAnimationFrame(pinchFrameRef.current);
              pinchFrameRef.current = null;
            }

            window.setTimeout(() => {
              pinchMovedRef.current = false;
            }, 160);
          }}
        >
          <div
            ref={lightboxFrameRef}
            className="lightbox-stage"
            style={baseSize ? { width: `${baseSize.width}px`, height: `${baseSize.height}px` } : undefined}
          >
            <img
              ref={lightboxImageRef}
              className={[
                zoomed ? "is-zoomed" : "",
                dragging ? "is-dragging" : "",
                pinching ? "is-pinching" : "",
                wheeling ? "is-wheeling" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              src={image.src}
              alt={image.alt}
              draggable={false}
              style={
                baseSize
                  ? {
                      width: `${baseSize.width}px`,
                      height: `${baseSize.height}px`,
                      transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`
                    }
                  : undefined
              }
              onLoad={(event) => onUpdateBaseSize(event.currentTarget)}
              onDragStart={(event) => event.preventDefault()}
              onPointerDown={(event) => {
                if (!zoomed || event.pointerType === "touch" || !lightboxMediaRef.current) {
                  return;
                }

                if (event.pointerType === "mouse" && event.button !== 0) {
                  return;
                }

                event.stopPropagation();
                dragMovedRef.current = false;
                lightboxDragRef.current = {
                  active: true,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  startPanX: lightboxPanRef.current.x,
                  startPanY: lightboxPanRef.current.y
                };
                onSetDragging(true);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (
                  !zoomed ||
                  event.pointerType === "touch" ||
                  !lightboxMediaRef.current ||
                  !lightboxDragRef.current.active ||
                  lightboxDragRef.current.pointerId !== event.pointerId
                ) {
                  return;
                }

                event.stopPropagation();
                const deltaX = event.clientX - lightboxDragRef.current.startX;
                const deltaY = event.clientY - lightboxDragRef.current.startY;

                if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                  dragMovedRef.current = true;
                }

                onSetPanState(
                  {
                    x: lightboxDragRef.current.startPanX + deltaX,
                    y: lightboxDragRef.current.startPanY + deltaY
                  },
                  lightboxScaleRef.current
                );
              }}
              onPointerUp={(event) => {
                if (lightboxDragRef.current.pointerId !== event.pointerId) {
                  return;
                }

                event.stopPropagation();

                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }

                onStopDrag();
              }}
              onPointerCancel={(event) => {
                if (lightboxDragRef.current.pointerId !== event.pointerId) {
                  return;
                }

                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }

                onStopDrag();
              }}
              onClick={(event) => {
                event.stopPropagation();

                if (pinchMovedRef.current || dragMovedRef.current) {
                  return;
                }

                onToggleZoom({ clientX: event.clientX, clientY: event.clientY });
              }}
            />
          </div>
        </div>
        <p>{image.caption}</p>
      </div>
    </div>
  );
}
