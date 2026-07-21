import type { MerchandiseSku } from "./merchandiseInventory";

export const defaultMerchandiseImages: Partial<Record<MerchandiseSku, string>> = {
  "MERCH-001": "/assets/merchandise/circular-josephite-magnet-clean.png",
  "MERCH-002": "/assets/merchandise/sticker-set.png",
  "MERCH-003": "/assets/merchandise/luggage-tag.png",
  "MERCH-004": "/assets/merchandise/school-crest-lapel-pin.png",
  "MERCH-009": "/assets/merchandise/andrews-badge.png",
  "MERCH-010": "/assets/merchandise/davids-badge.png",
  "MERCH-011": "/assets/merchandise/georges-badge.png",
  "MERCH-012": "/assets/merchandise/patricks-badge.png",
  "MERCH-013": "/assets/merchandise/andrews-tie-pin.png",
  "MERCH-014": "/assets/merchandise/davids-tie-pin.png",
  "MERCH-015": "/assets/merchandise/georges-tie-pin.png",
  "MERCH-016": "/assets/merchandise/patricks-tie-pin.png",
  "MERCH-017": "/assets/merchandise/coffee-table-book-100-years.png",
  "MERCH-018": "/assets/merchandise/faith-toil-book-150-years.png",
  "MERCH-019": "/assets/merchandise/paul-fernandes-print.png",
  "MERCH-020": "/assets/merchandise/laptop-bag.png",
  "MERCH-021": "/assets/merchandise/laptop-sleeve.jpeg",
  "MERCH-022": "/assets/merchandise/metal-water-bottle.png",
  "MERCH-023": "/assets/merchandise/wooden-bottle.png",
  "MERCH-024": "/assets/merchandise/scarf.png",
  "MERCH-025": "/assets/merchandise/cap.png",
  "BUNDLE-001": "/assets/merchandise/josephite-starter-bundle.png",
  "BUNDLE-002": "/assets/merchandise/alumni-essentials-bundle.png",
  "BUNDLE-004": "/assets/merchandise/heritage-bundle.png",
  "BUNDLE-005": "/assets/merchandise/art-memory-bundle.png",
  "BUNDLE-006": "/assets/merchandise/premium-josephite-bundle.png",
  "BUNDLE-011": "/assets/merchandise/davids-premium-house-bundle.png",
  "BUNDLE-012": "/assets/merchandise/georges-premium-house-bundle.png",
  "BUNDLE-013": "/assets/merchandise/patricks-premium-house-bundle.png",
  "BUNDLE-014": "/assets/merchandise/andrews-premium-house-bundle.png"
};

export function defaultMerchandiseImageFor(sku: MerchandiseSku) {
  return defaultMerchandiseImages[sku];
}
