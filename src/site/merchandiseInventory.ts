export const lastChanceQuantityThreshold = 10;

export const merchandiseInventoryDatabase = {
  "MERCH-001": {
    name: "Circular Josephite Magnet",
    description: "A classic Josephite keepsake for your fridge, office board, locker, or workspace.",
    quantity: 40,
    price: 5
  },
  "MERCH-002": {
    name: "Sticker Set",
    description: "Josephite-themed stickers for laptops, notebooks, water bottles, luggage, and everyday use.",
    quantity: 50,
    price: 5
  },
  "MERCH-003": {
    name: "Luggage Tag",
    description: "A practical travel accessory that lets you carry your Josephite identity wherever you go.",
    quantity: 50,
    price: 5
  },
  "MERCH-004": {
    name: "School Crest Lapel Pin",
    description: "A refined school crest pin for blazers, jackets, bags, reunions, and formal alumni occasions.",
    quantity: 40,
    price: 10
  },
  "MERCH-005": {
    name: "Davids Cufflinks",
    description: "A polished formal accessory for Davids House alumni and a thoughtful reunion gift.",
    quantity: 20,
    price: 10
  },
  "MERCH-006": {
    name: "Georges Cufflinks",
    description: "A classic formal accessory for Georges House alumni to carry their house pride.",
    quantity: 20,
    price: 10
  },
  "MERCH-007": {
    name: "Andrews Cufflinks",
    description: "A classic formal accessory for Andrews House alumni to carry their house pride.",
    quantity: 20,
    price: 10
  },
  "MERCH-008": {
    name: "Patricks Cufflinks",
    description: "A distinguished keepsake for Patricks House alumni and special occasions.",
    quantity: 20,
    price: 10
  },
  "MERCH-009": {
    name: "Andrews Badge",
    description: "A collectible badge for Andrews House alumni, ideal for events, display, or gifting.",
    quantity: 20,
    price: 10
  },
  "MERCH-010": {
    name: "Davids Badge",
    description: "A collectible badge for Davids House alumni and house-pride keepsakes.",
    quantity: 20,
    price: 10
  },
  "MERCH-011": {
    name: "Georges Badge",
    description: "A collectible badge for Georges House alumni, perfect for reunions and display collections.",
    quantity: 20,
    price: 10
  },
  "MERCH-012": {
    name: "Patricks Badge",
    description: "A classic badge for Patricks House alumni and Josephite collectors.",
    quantity: 20,
    price: 10
  },
  "MERCH-013": {
    name: "Andrews Tie Pin - Blue",
    description: "A smart blue house tie pin for Andrews House alumni and formal events.",
    quantity: 20,
    price: 10
  },
  "MERCH-014": {
    name: "Davids Tie Pin - Yellow",
    description: "A polished yellow house tie pin for Davids House alumni.",
    quantity: 20,
    price: 10
  },
  "MERCH-015": {
    name: "Georges Tie Pin - Red",
    description: "A refined red house tie pin for Georges House alumni.",
    quantity: 20,
    price: 10
  },
  "MERCH-016": {
    name: "Patricks Tie Pin - Green",
    description: "A classic green house tie pin for Patricks House alumni.",
    quantity: 20,
    price: 10
  },
  "MERCH-017": {
    name: "Coffee Table Book - 100 Years",
    description: "A commemorative book celebrating 100 years of St. Joseph's Boys' High School history and memories.",
    quantity: 20,
    price: 40
  },
  "MERCH-018": {
    name: "Faith & Toil Book - 150 Years",
    description: "A heritage book honoring 150 years of Josephite faith, toil, tradition, and legacy.",
    quantity: 20,
    price: 40
  },
  "MERCH-019": {
    name: "Paul Fernandes Framed Print (without glass)",
    description: "A nostalgic framed (without glass) Paul Fernandes print capturing the charm and memories of school life.",
    quantity: 20,
    price: 40
  },
  "MERCH-020": {
    name: "Laptop Bag",
    description: "A practical laptop bag for work, travel, and everyday Josephite pride.",
    quantity: 15,
    price: 40
  },
  "MERCH-021": {
    name: "Laptop Sleeve",
    description: "A sleek laptop sleeve that protects your device while carrying a touch of Josephite pride.",
    quantity: 15,
    price: 30
  },
  "MERCH-022": {
    name: "Metal Water Bottle",
    description: "A durable everyday water bottle for work, workouts, travel, and school events.",
    quantity: 30,
    price: 20
  },
  "MERCH-023": {
    name: "Bamboo Water Sipper",
    description: "A premium-feeling bamboo water sipper with a clean, natural look for home, office, or travel.",
    quantity: 30,
    price: 40
  },
  "MERCH-024": {
    name: "Scarf",
    description: "A classic Josephite scarf for alumni events, reunions, cooler days, and school-spirit occasions.",
    quantity: 30,
    price: 20
  },
  "MERCH-025": {
    name: "Cap",
    description: "A comfortable alumni cap for casual wear, outdoor events, reunions, and everyday pride.",
    quantity: 30,
    price: 20
  }
} as const;

export type MerchandiseInventorySku = keyof typeof merchandiseInventoryDatabase;

export type MerchandiseBundleComponent = {
  sku: MerchandiseInventorySku;
  quantity: number;
};

export const merchandiseBundleDatabase = {
  "BUNDLE-001": {
    name: "Josephite Starter Bundle",
    description: "Curated starter bundle featuring a magnet, sticker set, luggage tag, and school crest lapel pin.",
    price: 20,
    components: [
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 },
      { sku: "MERCH-003", quantity: 1 },
      { sku: "MERCH-004", quantity: 1 }
    ]
  },
  "BUNDLE-002": {
    name: "Alumni Essentials Bundle",
    description: "Everyday Josephite essentials featuring a cap, metal water bottle, magnet, sticker set, and luggage tag.",
    price: 45,
    components: [
      { sku: "MERCH-025", quantity: 1 },
      { sku: "MERCH-022", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 },
      { sku: "MERCH-003", quantity: 1 }
    ]
  },
  "BUNDLE-003": {
    name: "Work & Travel Bundle",
    description: "A practical work and travel set featuring a laptop sleeve, metal water bottle, luggage tag, and school crest lapel pin.",
    price: 55,
    components: [
      { sku: "MERCH-021", quantity: 1 },
      { sku: "MERCH-022", quantity: 1 },
      { sku: "MERCH-003", quantity: 1 },
      { sku: "MERCH-004", quantity: 1 }
    ]
  },
  "BUNDLE-004": {
    name: "Heritage Bundle",
    description: "A commemorative book bundle featuring the Coffee Table Book and Faith & Toil Book.",
    price: 70,
    components: [
      { sku: "MERCH-017", quantity: 1 },
      { sku: "MERCH-018", quantity: 1 }
    ]
  },
  "BUNDLE-005": {
    name: "Art & Memory Bundle",
    description: "A nostalgic keepsake bundle featuring the Paul Fernandes framed print, magnet, sticker set, and luggage tag.",
    price: 45,
    components: [
      { sku: "MERCH-019", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 },
      { sku: "MERCH-003", quantity: 1 }
    ]
  },
  "BUNDLE-006": {
    name: "Premium Josephite Gift Bundle",
    description: "A premium alumni gift bundle featuring both books, school crest lapel pin, Paul Fernandes framed print, and magnet.",
    price: 110,
    components: [
      { sku: "MERCH-017", quantity: 1 },
      { sku: "MERCH-018", quantity: 1 },
      { sku: "MERCH-004", quantity: 1 },
      { sku: "MERCH-019", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 }
    ]
  },
  "BUNDLE-007": {
    name: "Andrews House Pride Bundle",
    description: "Andrews House bundle featuring badge, blue tie pin, magnet, and sticker set.",
    price: 25,
    components: [
      { sku: "MERCH-009", quantity: 1 },
      { sku: "MERCH-013", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  },
  "BUNDLE-008": {
    name: "Davids House Pride Bundle",
    description: "Davids House bundle featuring badge, yellow tie pin, magnet, and sticker set.",
    price: 25,
    components: [
      { sku: "MERCH-010", quantity: 1 },
      { sku: "MERCH-014", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  },
  "BUNDLE-009": {
    name: "Georges House Pride Bundle",
    description: "Georges House bundle featuring badge, red tie pin, magnet, and sticker set.",
    price: 25,
    components: [
      { sku: "MERCH-011", quantity: 1 },
      { sku: "MERCH-015", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  },
  "BUNDLE-010": {
    name: "Patricks House Pride Bundle",
    description: "Patricks House bundle featuring badge, green tie pin, magnet, and sticker set.",
    price: 25,
    components: [
      { sku: "MERCH-012", quantity: 1 },
      { sku: "MERCH-016", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  },
  "BUNDLE-011": {
    name: "Davids Premium House Bundle",
    description: "Premium Davids House bundle featuring badge, yellow tie pin, cufflinks, magnet, and sticker set.",
    price: 35,
    components: [
      { sku: "MERCH-010", quantity: 1 },
      { sku: "MERCH-014", quantity: 1 },
      { sku: "MERCH-005", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  },
  "BUNDLE-012": {
    name: "Georges Premium House Bundle",
    description: "Premium Georges House bundle featuring badge, red tie pin, cufflinks, magnet, and sticker set.",
    price: 35,
    components: [
      { sku: "MERCH-011", quantity: 1 },
      { sku: "MERCH-015", quantity: 1 },
      { sku: "MERCH-006", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  },
  "BUNDLE-013": {
    name: "Patricks Premium House Bundle",
    description: "Premium Patricks House bundle featuring badge, green tie pin, cufflinks, magnet, and sticker set.",
    price: 35,
    components: [
      { sku: "MERCH-012", quantity: 1 },
      { sku: "MERCH-016", quantity: 1 },
      { sku: "MERCH-008", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  },
  "BUNDLE-014": {
    name: "Andrews Premium House Bundle",
    description: "Premium Andrews House bundle featuring badge, blue tie pin, school crest lapel pin, magnet, and sticker set.",
    price: 35,
    components: [
      { sku: "MERCH-009", quantity: 1 },
      { sku: "MERCH-013", quantity: 1 },
      { sku: "MERCH-004", quantity: 1 },
      { sku: "MERCH-001", quantity: 1 },
      { sku: "MERCH-002", quantity: 1 }
    ]
  }
} as const;

export type MerchandiseBundleSku = keyof typeof merchandiseBundleDatabase;
export type MerchandiseSku = MerchandiseInventorySku | MerchandiseBundleSku;

export function isInventorySku(sku: string): sku is MerchandiseInventorySku {
  return sku in merchandiseInventoryDatabase;
}

export function isBundleSku(sku: string): sku is MerchandiseBundleSku {
  return sku in merchandiseBundleDatabase;
}

export function merchandiseNameFor(sku: MerchandiseSku) {
  return isBundleSku(sku) ? merchandiseBundleDatabase[sku].name : merchandiseInventoryDatabase[sku].name;
}

export function merchandisePriceFor(sku: MerchandiseSku) {
  return isBundleSku(sku) ? merchandiseBundleDatabase[sku].price : merchandiseInventoryDatabase[sku].price;
}

export function merchandiseDescriptionFor(sku: MerchandiseSku) {
  return isBundleSku(sku) ? merchandiseBundleDatabase[sku].description : merchandiseInventoryDatabase[sku].description;
}

export function inventoryQuantityFor(sku: MerchandiseInventorySku) {
  return merchandiseInventoryDatabase[sku].quantity;
}

export function componentsForMerchandiseSku(sku: MerchandiseSku): MerchandiseBundleComponent[] {
  if (isBundleSku(sku)) {
    return merchandiseBundleDatabase[sku].components.map((component) => ({ ...component }));
  }

  return [{ sku, quantity: 1 }];
}

export function bundleAvailableQuantityFor(
  sku: MerchandiseBundleSku,
  inventoryBySku: Partial<Record<MerchandiseInventorySku, number>> = {}
) {
  return Math.min(
    ...merchandiseBundleDatabase[sku].components.map((component) => {
      const availableQuantity = inventoryBySku[component.sku] ?? merchandiseInventoryDatabase[component.sku].quantity;

      return Math.floor(availableQuantity / component.quantity);
    })
  );
}

export function initialQuantityFor(sku: MerchandiseSku) {
  return isBundleSku(sku) ? bundleAvailableQuantityFor(sku) : inventoryQuantityFor(sku);
}
