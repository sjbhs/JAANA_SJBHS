import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  componentsForMerchandiseSku,
  initialQuantityFor,
  inventoryQuantityFor,
  lastChanceQuantityThreshold,
  merchandiseDescriptionFor,
  merchandiseNameFor,
  merchandisePriceFor,
  type MerchandiseBundleComponent,
  type MerchandiseInventorySku,
  type MerchandiseSku
} from "../merchandiseInventory";

type Product = {
  id: string;
  sku: MerchandiseSku;
  name: string;
  category: string;
  price?: number;
  inventoryQuantity: number;
  imageSrc?: string;
  imageAlt: string;
  badge: string;
  description: string;
  sizeLabel: string;
  sizes: string[];
  colorLabel: string;
  colors: string[];
  components?: MerchandiseBundleComponent[];
};

type ProductOption = {
  size: string;
  color: string;
};

type CartItem = ProductOption & {
  productId: string;
  quantity: number;
};

type MerchandiseInventoryApiRow = {
  sku: string;
  availableQuantity: number;
};

type MerchandiseReservationResponse = {
  reservation?: {
    id: string;
  };
  inventory?: MerchandiseInventoryApiRow[];
  error?: string;
};

const storeProductCatalog: Array<Omit<Product, "price" | "components">> = [
  {
    id: "circular-josephite-magnet",
    sku: "MERCH-001",
    name: "Circular Josephite Magnet",
    category: "Stickers & Magnets",
    inventoryQuantity: inventoryQuantityFor("MERCH-001"),
    imageSrc: "/assets/merchandise/circular-josephite-magnet-clean.png",
    imageAlt: "Circular Josephite magnet preview",
    badge: "Magnet",
    description: "Round Josephite magnet with blue-and-white striping for fridges, lockers, and office boards.",
    sizeLabel: "Size",
    sizes: ["Standard"],
    colorLabel: "Design",
    colors: ["Blue and white"]
  },
  {
    id: "sticker-set",
    sku: "MERCH-002",
    name: "Sticker Set",
    category: "Stickers & Magnets",
    inventoryQuantity: inventoryQuantityFor("MERCH-002"),
    imageSrc: "/assets/merchandise/sticker-set.png",
    imageAlt: "Josephite sticker set preview with house-color decals",
    badge: "Sticker set",
    description: "Josephite sticker assortment for notebooks, laptops, luggage inserts, and keepsake packs.",
    sizeLabel: "Pack",
    sizes: ["Set"],
    colorLabel: "Design",
    colors: ["Assorted"]
  },
  {
    id: "luggage-tag",
    sku: "MERCH-003",
    name: "Luggage Tag",
    category: "Travel",
    inventoryQuantity: inventoryQuantityFor("MERCH-003"),
    imageSrc: "/assets/merchandise/luggage-tag.png",
    imageAlt: "SJBHS OBA 100 luggage tag preview",
    badge: "Travel",
    description: "Navy luggage tag with crest detail and house-color accents for reunion travel.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "Color",
    colors: ["Navy"]
  },
  {
    id: "school-crest-lapel-pin",
    sku: "MERCH-004",
    name: "School Crest Lapel Pin",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-004"),
    imageSrc: "/assets/merchandise/school-crest-lapel-pin.png",
    imageAlt: "School crest lapel pin preview",
    badge: "Crest pin",
    description: "Centenary-style school crest lapel pin with gold edging and enamel detail.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "Finish",
    colors: ["Gold enamel"]
  },
  {
    id: "davids-cufflinks",
    sku: "MERCH-005",
    name: "Davids Cufflinks",
    category: "Cufflinks",
    inventoryQuantity: inventoryQuantityFor("MERCH-005"),
    imageAlt: "Davids cufflinks preview unavailable",
    badge: "Davids",
    description: "Davids house accessory in yellow and white with a polished gold-tone finish.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Davids yellow"]
  },
  {
    id: "georges-cufflinks",
    sku: "MERCH-006",
    name: "Georges Cufflinks",
    category: "Cufflinks",
    inventoryQuantity: inventoryQuantityFor("MERCH-006"),
    imageAlt: "Georges cufflinks preview unavailable",
    badge: "Georges",
    description: "Georges house accessory in red and white with a polished gold-tone finish.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Georges red"]
  },
  {
    id: "andrews-cufflinks",
    sku: "MERCH-007",
    name: "Andrews Cufflinks",
    category: "Cufflinks",
    inventoryQuantity: inventoryQuantityFor("MERCH-007"),
    imageAlt: "Andrews cufflinks preview unavailable",
    badge: "Andrews",
    description: "Andrews house accessory in blue and white with a polished gold-tone finish.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Andrews blue"]
  },
  {
    id: "patricks-cufflinks",
    sku: "MERCH-008",
    name: "Patricks Cufflinks",
    category: "Cufflinks",
    inventoryQuantity: inventoryQuantityFor("MERCH-008"),
    imageAlt: "Patricks cufflinks preview unavailable",
    badge: "Patricks",
    description: "Patricks house accessory in green and white with a polished gold-tone finish.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Patricks green"]
  },
  {
    id: "andrews-badge",
    sku: "MERCH-009",
    name: "Andrews Badge",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-009"),
    imageSrc: "/assets/merchandise/andrews-badge.png",
    imageAlt: "Andrews blue house badge preview",
    badge: "Andrews",
    description: "Blue Andrews house badge with enamel color and gold edging.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Andrews blue"]
  },
  {
    id: "davids-badge",
    sku: "MERCH-010",
    name: "Davids Badge",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-010"),
    imageSrc: "/assets/merchandise/davids-badge.png",
    imageAlt: "Davids yellow house badge preview",
    badge: "Davids",
    description: "Yellow Davids house badge with enamel color and gold edging.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Davids yellow"]
  },
  {
    id: "georges-badge",
    sku: "MERCH-011",
    name: "Georges Badge",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-011"),
    imageSrc: "/assets/merchandise/georges-badge.png",
    imageAlt: "Georges red house badge preview",
    badge: "Georges",
    description: "Red Georges house badge with enamel color and gold edging.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Georges red"]
  },
  {
    id: "patricks-badge",
    sku: "MERCH-012",
    name: "Patricks Badge",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-012"),
    imageSrc: "/assets/merchandise/patricks-badge.png",
    imageAlt: "Patricks green house badge preview",
    badge: "Patricks",
    description: "Green Patricks house badge with enamel color and gold edging.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Patricks green"]
  },
  {
    id: "andrews-tie-pin",
    sku: "MERCH-013",
    name: "Andrews Tie Pin - Blue",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-013"),
    imageSrc: "/assets/merchandise/andrews-tie-pin.png",
    imageAlt: "Andrews blue tie pin preview",
    badge: "Tie pin",
    description: "Blue Andrews house tie pin with shield face and gold-tone bar.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Andrews blue"]
  },
  {
    id: "davids-tie-pin",
    sku: "MERCH-014",
    name: "Davids Tie Pin - Yellow",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-014"),
    imageSrc: "/assets/merchandise/davids-tie-pin.png",
    imageAlt: "Davids yellow tie pin preview",
    badge: "Tie pin",
    description: "Yellow Davids house tie pin with shield face and gold-tone bar.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Davids yellow"]
  },
  {
    id: "georges-tie-pin",
    sku: "MERCH-015",
    name: "Georges Tie Pin - Red",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-015"),
    imageSrc: "/assets/merchandise/georges-tie-pin.png",
    imageAlt: "Georges red tie pin preview",
    badge: "Tie pin",
    description: "Red Georges house tie pin with shield face and gold-tone bar.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Georges red"]
  },
  {
    id: "patricks-tie-pin",
    sku: "MERCH-016",
    name: "Patricks Tie Pin - Green",
    category: "Pins & Badges",
    inventoryQuantity: inventoryQuantityFor("MERCH-016"),
    imageSrc: "/assets/merchandise/patricks-tie-pin.png",
    imageAlt: "Patricks green tie pin preview",
    badge: "Tie pin",
    description: "Green Patricks house tie pin with shield face and gold-tone bar.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "House",
    colors: ["Patricks green"]
  },
  {
    id: "coffee-table-book-100-years",
    sku: "MERCH-017",
    name: "Coffee Table Book - 100 Years",
    category: "Books & Art",
    inventoryQuantity: inventoryQuantityFor("MERCH-017"),
    imageSrc: "/assets/merchandise/coffee-table-book-100-years.png",
    imageAlt: "Coffee table book 100 years preview",
    badge: "Book",
    description: "Centenary coffee table book keepsake with SJBHS OBA artwork and heritage imagery.",
    sizeLabel: "Format",
    sizes: ["Hardcover"],
    colorLabel: "Edition",
    colors: ["100 Years"]
  },
  {
    id: "faith-toil-book-150-years",
    sku: "MERCH-018",
    name: "Faith & Toil Book - 150 Years",
    category: "Books & Art",
    inventoryQuantity: inventoryQuantityFor("MERCH-018"),
    imageSrc: "/assets/merchandise/faith-toil-book-150-years.png",
    imageAlt: "Faith and Toil book 150 years preview",
    badge: "Book",
    description: "Faith & Toil history volume commemorating the school legacy.",
    sizeLabel: "Format",
    sizes: ["Hardcover"],
    colorLabel: "Edition",
    colors: ["150 Years"]
  },
  {
    id: "paul-fernandes-print",
    sku: "MERCH-019",
    name: "Paul Fernandes Unframed Mounted Print",
    category: "Books & Art",
    inventoryQuantity: inventoryQuantityFor("MERCH-019"),
    imageSrc: "/assets/merchandise/paul-fernandes-print.png",
    imageAlt: "Paul Fernandes unframed mounted print preview",
    badge: "Art print",
    description: "Unframed mounted Josephite Forever print featuring Paul Fernandes artwork.",
    sizeLabel: "Format",
    sizes: ["Mounted print"],
    colorLabel: "Frame",
    colors: ["Unframed"]
  },
  {
    id: "laptop-bag",
    sku: "MERCH-020",
    name: "Laptop Bag",
    category: "Travel",
    inventoryQuantity: inventoryQuantityFor("MERCH-020"),
    imageAlt: "Laptop bag preview unavailable",
    badge: "Bag",
    description: "Josephite laptop bag inventory item. Product preview unavailable for now.",
    sizeLabel: "Size",
    sizes: ["Laptop"],
    colorLabel: "Color",
    colors: ["Navy"]
  },
  {
    id: "laptop-sleeve",
    sku: "MERCH-021",
    name: "Laptop Sleeve",
    category: "Travel",
    inventoryQuantity: inventoryQuantityFor("MERCH-021"),
    imageAlt: "Laptop sleeve preview unavailable",
    badge: "Sleeve",
    description: "Josephite laptop sleeve inventory item. Product preview unavailable for now.",
    sizeLabel: "Size",
    sizes: ["Laptop"],
    colorLabel: "Color",
    colors: ["Navy"]
  },
  {
    id: "metal-water-bottle",
    sku: "MERCH-022",
    name: "Metal Water Bottle",
    category: "Drinkware",
    inventoryQuantity: inventoryQuantityFor("MERCH-022"),
    imageSrc: "/assets/merchandise/metal-water-bottle.png",
    imageAlt: "Black Josephite metal water bottle preview",
    badge: "Bottle",
    description: "Black metal water bottle with SJBHS-inspired artwork and Fide et Labore script.",
    sizeLabel: "Size",
    sizes: ["Standard"],
    colorLabel: "Color",
    colors: ["Black"]
  },
  {
    id: "bamboo-water-sipper",
    sku: "MERCH-023",
    name: "Bamboo Water Sipper",
    category: "Drinkware",
    inventoryQuantity: inventoryQuantityFor("MERCH-023"),
    imageSrc: "/assets/merchandise/wooden-bottle.png",
    imageAlt: "Bamboo Josephite water sipper preview",
    badge: "Bamboo",
    description: "Bamboo-finish water sipper with SJBHS OBA crest marking and insulated interior.",
    sizeLabel: "Size",
    sizes: ["Standard"],
    colorLabel: "Finish",
    colors: ["Bamboo"]
  },
  {
    id: "scarf",
    sku: "MERCH-024",
    name: "Scarf",
    category: "Apparel",
    inventoryQuantity: inventoryQuantityFor("MERCH-024"),
    imageSrc: "/assets/merchandise/scarf.png",
    imageAlt: "Black Josephite scarf preview",
    badge: "Scarf",
    description: "Black Josephite scarf with embroidered crest, Fide et Labore detail, and light trim.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "Color",
    colors: ["Black"]
  },
  {
    id: "cap",
    sku: "MERCH-025",
    name: "Cap",
    category: "Apparel",
    inventoryQuantity: inventoryQuantityFor("MERCH-025"),
    imageSrc: "/assets/merchandise/cap.png",
    imageAlt: "Navy Josephite cap preview",
    badge: "Cap",
    description: "Navy cap with embroidered SJBHS OBA crest and house-shield side detail.",
    sizeLabel: "Size",
    sizes: ["One size"],
    colorLabel: "Color",
    colors: ["Navy"]
  },
  {
    id: "josephite-starter-bundle",
    sku: "BUNDLE-001",
    name: "Josephite Starter Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-001"),
    imageSrc: "/assets/merchandise/josephite-starter-bundle.png",
    imageAlt: "Josephite Starter Bundle preview",
    badge: "Bundle",
    description: "Curated starter bundle featuring a magnet, sticker set, luggage tag, and school crest lapel pin.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "alumni-essentials-bundle",
    sku: "BUNDLE-002",
    name: "Alumni Essentials Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-002"),
    imageSrc: "/assets/merchandise/alumni-essentials-bundle.png",
    imageAlt: "Alumni Essentials Bundle preview",
    badge: "Bundle",
    description: "Everyday Josephite essentials featuring a cap, metal water bottle, magnet, sticker set, and luggage tag.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "work-travel-bundle",
    sku: "BUNDLE-003",
    name: "Work & Travel Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-003"),
    imageAlt: "Work & Travel Bundle preview unavailable",
    badge: "Bundle",
    description: "A practical work and travel set featuring a laptop sleeve, metal water bottle, luggage tag, and school crest lapel pin.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "heritage-bundle",
    sku: "BUNDLE-004",
    name: "Heritage Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-004"),
    imageSrc: "/assets/merchandise/heritage-bundle.png",
    imageAlt: "Heritage Bundle preview",
    badge: "Bundle",
    description: "A commemorative book bundle featuring the Coffee Table Book and Faith & Toil Book.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "art-memory-bundle",
    sku: "BUNDLE-005",
    name: "Art & Memory Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-005"),
    imageSrc: "/assets/merchandise/art-memory-bundle.png",
    imageAlt: "Art & Memory Bundle preview",
    badge: "Bundle",
    description: "A nostalgic keepsake bundle featuring the Paul Fernandes framed print, magnet, sticker set, and luggage tag.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "premium-josephite-gift-bundle",
    sku: "BUNDLE-006",
    name: "Premium Josephite Gift Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-006"),
    imageSrc: "/assets/merchandise/premium-josephite-bundle.png",
    imageAlt: "Premium Josephite Gift Bundle preview",
    badge: "Bundle",
    description: "A premium alumni gift bundle featuring both books, school crest lapel pin, Paul Fernandes framed print, and magnet.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "andrews-house-pride-bundle",
    sku: "BUNDLE-007",
    name: "Andrews House Pride Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-007"),
    imageAlt: "Andrews House Pride Bundle preview unavailable",
    badge: "Bundle",
    description: "Andrews House bundle featuring badge, blue tie pin, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "davids-house-pride-bundle",
    sku: "BUNDLE-008",
    name: "Davids House Pride Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-008"),
    imageAlt: "Davids House Pride Bundle preview unavailable",
    badge: "Bundle",
    description: "Davids House bundle featuring badge, yellow tie pin, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "georges-house-pride-bundle",
    sku: "BUNDLE-009",
    name: "Georges House Pride Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-009"),
    imageAlt: "Georges House Pride Bundle preview unavailable",
    badge: "Bundle",
    description: "Georges House bundle featuring badge, red tie pin, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "patricks-house-pride-bundle",
    sku: "BUNDLE-010",
    name: "Patricks House Pride Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-010"),
    imageAlt: "Patricks House Pride Bundle preview unavailable",
    badge: "Bundle",
    description: "Patricks House bundle featuring badge, green tie pin, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "davids-premium-house-bundle",
    sku: "BUNDLE-011",
    name: "Davids Premium House Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-011"),
    imageSrc: "/assets/merchandise/davids-premium-house-bundle.png",
    imageAlt: "Davids Premium House Bundle preview",
    badge: "Bundle",
    description: "Premium Davids House bundle featuring badge, yellow tie pin, cufflinks, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "georges-premium-house-bundle",
    sku: "BUNDLE-012",
    name: "Georges Premium House Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-012"),
    imageSrc: "/assets/merchandise/georges-premium-house-bundle.png",
    imageAlt: "Georges Premium House Bundle preview",
    badge: "Bundle",
    description: "Premium Georges House bundle featuring badge, red tie pin, cufflinks, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "patricks-premium-house-bundle",
    sku: "BUNDLE-013",
    name: "Patricks Premium House Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-013"),
    imageSrc: "/assets/merchandise/patricks-premium-house-bundle.png",
    imageAlt: "Patricks Premium House Bundle preview",
    badge: "Bundle",
    description: "Premium Patricks House bundle featuring badge, green tie pin, cufflinks, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  },
  {
    id: "andrews-premium-house-bundle",
    sku: "BUNDLE-014",
    name: "Andrews Premium House Bundle",
    category: "Bundles",
    inventoryQuantity: initialQuantityFor("BUNDLE-014"),
    imageSrc: "/assets/merchandise/andrews-premium-house-bundle.png",
    imageAlt: "Andrews Premium House Bundle preview",
    badge: "Bundle",
    description: "Premium Andrews House bundle featuring badge, blue tie pin, school crest lapel pin, magnet, and sticker set.",
    sizeLabel: "Bundle",
    sizes: ["Bundle"],
    colorLabel: "Selection",
    colors: ["As listed"]
  }
];

const storeProducts: Product[] = storeProductCatalog.map((product) => ({
  ...product,
  name: merchandiseNameFor(product.sku),
  description: merchandiseDescriptionFor(product.sku),
  price: merchandisePriceFor(product.sku),
  components: componentsForMerchandiseSku(product.sku)
}));

const categories = ["All", "Bundles", "Stickers & Magnets", "Travel", "Pins & Badges", "Cufflinks", "Books & Art", "Drinkware", "Apparel"];
const initialInventoryBySku = Object.fromEntries(
  storeProducts.map((product) => [product.sku, product.inventoryQuantity])
) as Record<string, number>;

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function formatPrice(value: number | undefined) {
  return typeof value === "number" ? formatMoney(value) : "Price TBD";
}

function cartKey(item: ProductOption & { productId: string }) {
  return `${item.productId}::${item.size}::${item.color}`;
}

function defaultOption(product: Product): ProductOption {
  return {
    size: product.sizes[0],
    color: product.colors[0]
  };
}

function lastChanceNoteFor(remainingQuantity: number) {
  if (remainingQuantity <= 0 || remainingQuantity > lastChanceQuantityThreshold) {
    return "";
  }

  return `Selling out: last ${remainingQuantity} ${remainingQuantity === 1 ? "quantity" : "quantities"} left`;
}

function inventoryMapFromRows(rows: MerchandiseInventoryApiRow[]) {
  return rows.reduce<Record<string, number>>((inventory, row) => {
    if (typeof row.sku === "string" && Number.isFinite(row.availableQuantity)) {
      inventory[row.sku] = Math.max(0, Math.floor(row.availableQuantity));
    }

    return inventory;
  }, {});
}

function availableQuantityForComponents(
  components: MerchandiseBundleComponent[] | undefined,
  inventoryBySku: Record<string, number>
) {
  const productComponents = components?.length ? components : [];

  if (!productComponents.length) {
    return 0;
  }

  return Math.min(
    ...productComponents.map((component) => {
      const availableQuantity = inventoryBySku[component.sku] ?? inventoryQuantityFor(component.sku);

      return Math.floor(Math.max(availableQuantity, 0) / component.quantity);
    })
  );
}

export function MerchandiseStorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [inventoryBySku, setInventoryBySku] = useState<Record<string, number>>(initialInventoryBySku);
  const [optionsByProduct, setOptionsByProduct] = useState<Record<string, ProductOption>>({});
  const [quantitiesByProduct, setQuantitiesByProduct] = useState<Record<string, number>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);

  const productsWithInventory = useMemo(
    () =>
      storeProducts.map((product) => ({
        ...product,
        inventoryQuantity: availableQuantityForComponents(product.components, inventoryBySku)
      })),
    [inventoryBySku]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return productsWithInventory.filter((product) => {
      const categoryMatches = selectedCategory === "All" || product.category === selectedCategory;
      const queryMatches =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery);

      return categoryMatches && queryMatches;
    });
  }, [productsWithInventory, query, selectedCategory]);

  const cartLines = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = productsWithInventory.find((candidate) => candidate.id === item.productId);

          return product ? { ...item, product } : null;
        })
        .filter((item): item is CartItem & { product: Product } => Boolean(item)),
    [cartItems, productsWithInventory]
  );

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartHasCompletePrices = cartLines.length > 0 && cartLines.every((item) => typeof item.product.price === "number");
  const subtotal = cartHasCompletePrices
    ? cartLines.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0)
    : undefined;
  const total = subtotal;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Josephite Store | JAANA";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      try {
        const response = await fetch("/api/merchandise/inventory", {
          headers: {
            Accept: "application/json"
          }
        });
        const payload = (await response.json()) as { inventory?: MerchandiseInventoryApiRow[] };

        if (!cancelled && response.ok && Array.isArray(payload.inventory)) {
          setInventoryBySku((current) => ({
            ...current,
            ...inventoryMapFromRows(payload.inventory ?? [])
          }));
        }
      } catch {
        // Static inventory remains usable if the API is unavailable during local front-end previews.
      }
    }

    void loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!previewProduct) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewProduct(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewProduct]);

  const selectedOptionFor = (product: Product) => optionsByProduct[product.id] ?? defaultOption(product);
  const quantityInCartForComponent = (
    componentSku: MerchandiseInventorySku,
    items = cartItems,
    ignoredItemKey = ""
  ) =>
    items.reduce((total, item) => {
      if (ignoredItemKey && cartKey(item) === ignoredItemKey) {
        return total;
      }

      const product = storeProducts.find((candidate) => candidate.id === item.productId);
      const component = product?.components?.find((candidate) => candidate.sku === componentSku);

      return component ? total + component.quantity * item.quantity : total;
    }, 0);
  const remainingInventoryForProduct = (product: Product, items = cartItems, ignoredItemKey = "") =>
    Math.max(
      Math.min(
        ...(product.components ?? []).map((component) => {
          const availableQuantity = inventoryBySku[component.sku] ?? inventoryQuantityFor(component.sku);
          const usedQuantity = quantityInCartForComponent(component.sku, items, ignoredItemKey);

          return Math.floor((availableQuantity - usedQuantity) / component.quantity);
        })
      ),
      0
    );
  const selectedQuantityFor = (product: Product) => {
    const maxSelectableQuantity = Math.max(remainingInventoryForProduct(product), 1);

    return Math.min(quantitiesByProduct[product.id] ?? 1, maxSelectableQuantity);
  };

  const updateProductQuantity = (product: Product, quantity: number) => {
    const maxSelectableQuantity = Math.max(remainingInventoryForProduct(product), 1);

    setQuantitiesByProduct((current) => ({
      ...current,
      [product.id]: Math.min(Math.max(quantity, 1), maxSelectableQuantity)
    }));
  };

  const updateProductOption = (product: Product, key: keyof ProductOption, value: string) => {
    setOptionsByProduct((current) => ({
      ...current,
      [product.id]: {
        ...selectedOptionFor(product),
        [key]: value
      }
    }));
  };

  const addToCart = (product: Product, quantity = selectedQuantityFor(product)) => {
    const selectedOption = selectedOptionFor(product);
    const nextItem = {
      productId: product.id,
      size: selectedOption.size,
      color: selectedOption.color
    };
    const nextKey = cartKey(nextItem);

    setCheckoutComplete(false);
    setCheckoutStatus("");
    setCheckoutError("");
    setCartItems((current) => {
      const existingItem = current.find((item) => cartKey(item) === nextKey);
      const remainingQuantity = remainingInventoryForProduct(product, current);
      const safeQuantity = Math.min(Math.max(quantity, 1), remainingQuantity);

      if (safeQuantity <= 0) {
        return current;
      }

      if (existingItem) {
        return current.map((item) =>
          cartKey(item) === nextKey
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
      }

      return [...current, { ...nextItem, quantity: safeQuantity }];
    });
  };

  const orderNow = (product: Product) => {
    addToCart(product);
    setCartOpen(true);
  };

  const updateCartQuantity = (item: CartItem, product: Product, quantity: number) => {
    const itemKey = cartKey(item);

    setCheckoutComplete(false);
    setCheckoutStatus("");
    setCheckoutError("");
    setCartItems((current) => {
      if (quantity <= 0) {
        return current.filter((candidate) => cartKey(candidate) !== itemKey);
      }

      const maxLineQuantity = remainingInventoryForProduct(product, current, itemKey);

      return current.map((candidate) =>
        cartKey(candidate) === itemKey ? { ...candidate, quantity: Math.min(quantity, maxLineQuantity) } : candidate
      );
    });
  };

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cartItems.length) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    setIsCheckoutSubmitting(true);
    setCheckoutComplete(false);
    setCheckoutStatus("");
    setCheckoutError("");

    try {
      const response = await fetch("/api/merchandise/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          customer: {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? "")
          },
          items: cartLines.map((item) => ({
            sku: item.product.sku,
            size: item.size,
            color: item.color,
            quantity: item.quantity
          }))
        })
      });
      const payload = (await response.json()) as MerchandiseReservationResponse;

      if (Array.isArray(payload.inventory)) {
        setInventoryBySku((current) => ({
          ...current,
          ...inventoryMapFromRows(payload.inventory ?? [])
        }));
      }

      if (!response.ok) {
        setCheckoutError(payload.error ?? "Unable to reserve the selected merchandise.");
        return;
      }

      setCartItems([]);
      setQuantitiesByProduct({});
      setCheckoutComplete(true);
      setCheckoutStatus(
        `Reservation ${payload.reservation?.id ?? "saved"} is confirmed for event pickup. No payment is collected now.`
      );
    } catch {
      setCheckoutError("Unable to reach the reservation service. Please try again.");
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };

  const handleMainWebsiteRedirect = () => {
    setRedirectDialogOpen(true);
  };

  return (
    <div className="store-shell">
      <header className="store-header">
        <div className="store-brand" aria-label="JAANA Josephite Store">
          <img src="/assets/jaana-wordmark.png" alt="JAANA wordmark" />
        </div>
        <button className="store-main-site-link" type="button" onClick={handleMainWebsiteRedirect}>
          Main website
        </button>
        <form className="store-search" role="search">
          <label className="visually-hidden" htmlFor="store-search-input">
            Search merchandise
          </label>
          <input
            id="store-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search shirts, pins, caps, gifts"
          />
        </form>
        <button
          className="store-cart-link"
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart with ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
        >
          <span className="store-cart-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="9" cy="20" r="1.6" />
              <circle cx="18" cy="20" r="1.6" />
              <path d="M3 4h2.3l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H7" />
            </svg>
          </span>
          <strong>{cartCount}</strong>
        </button>
      </header>

      <main className="store-main">
        {!cartOpen ? (
          <>
            <section className="store-hero" aria-labelledby="store-title">
              <div className="store-hero-copy">
                <h1 id="store-title">JAANA Store</h1>
                <p>
                  Bring home Josephite keepsakes that spark school-day memories. Reserve your favorites before they sell out.
                </p>
              </div>
              <div className="store-hero-visual" aria-label="Featured Josephite merchandise">
                <div className="store-hero-collage">
                  <img className="store-hero-collage-main" src="/assets/merchandise/cap.png" alt="Josephite cap preview" />
                  <img src="/assets/merchandise/school-crest-lapel-pin.png" alt="School crest lapel pin preview" />
                  <img src="/assets/merchandise/sticker-set.png" alt="Josephite sticker set preview" />
                  <img src="/assets/merchandise/luggage-tag.png" alt="Josephite luggage tag preview" />
                  <img src="/assets/merchandise/circular-josephite-magnet-clean.png" alt="Circular Josephite magnet preview" />
                </div>
              </div>
            </section>

            <section className="store-toolbar" aria-label="Store categories">
              <div className="store-category-tabs">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={category === selectedCategory ? "store-category is-active" : "store-category"}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <p>{filteredProducts.length} items</p>
            </section>

            <section className="store-product-grid" aria-label="Josephite merchandise products">
              {filteredProducts.map((product) => {
                const selectedOption = selectedOptionFor(product);
                const selectedQuantity = selectedQuantityFor(product);
                const remainingInventory = remainingInventoryForProduct(product);
                const maxSelectableQuantity = Math.max(remainingInventory, 1);
                const lastChanceNote = lastChanceNoteFor(remainingInventory);
                const canAddToCart = remainingInventory > 0;

                return (
                  <article className="store-product-card" key={product.id}>
                    {product.imageSrc ? (
                      <button
                        className="store-product-media"
                        type="button"
                        onClick={() => setPreviewProduct(product)}
                        aria-label={`View full image for ${product.name}`}
                      >
                        <img src={product.imageSrc} alt={product.imageAlt} />
                      </button>
                    ) : (
                      <div className="store-product-media store-product-media-placeholder" aria-label={product.imageAlt}>
                        <span>Preview unavailable for now</span>
                      </div>
                    )}
                    <div className="store-product-copy">
                      <div className="store-product-heading">
                        <div>
                          <p>{product.category}</p>
                          <h2>{product.name}</h2>
                        </div>
                        <strong>{formatPrice(product.price)}</strong>
                      </div>
                      <p className="store-product-description">{product.description}</p>
                      <div className="store-product-alert-slot">
                        {lastChanceNote ? <p className="store-product-alert">{lastChanceNote}</p> : null}
                      </div>
                      {product.sizes.length > 1 || product.colors.length > 1 ? (
                        <div className="store-option-grid">
                          <label>
                            {product.sizeLabel}
                            <select
                              value={selectedOption.size}
                              onChange={(event) => updateProductOption(product, "size", event.target.value)}
                            >
                              {product.sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            {product.colorLabel}
                            <select
                              value={selectedOption.color}
                              onChange={(event) => updateProductOption(product, "color", event.target.value)}
                            >
                              {product.colors.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      ) : null}
                      <div className="store-buy-box" aria-label={`${product.name} purchase controls`}>
                        <div className="store-card-quantity" aria-label={`${product.name} quantity`}>
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product, selectedQuantity - 1)}
                            aria-label={`Decrease ${product.name} quantity`}
                            disabled={selectedQuantity <= 1}
                          >
                            -
                          </button>
                          <span>{selectedQuantity}</span>
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product, selectedQuantity + 1)}
                            aria-label={`Increase ${product.name} quantity`}
                            disabled={selectedQuantity >= maxSelectableQuantity || !canAddToCart}
                          >
                            +
                          </button>
                        </div>
                        <button className="primary-button store-add-button" type="button" onClick={() => addToCart(product)} disabled={!canAddToCart}>
                          {canAddToCart ? "Add to cart" : "Max in cart"}
                        </button>
                        <button className="store-order-now-button" type="button" onClick={() => orderNow(product)} disabled={!canAddToCart}>
                          Order now
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        ) : (
          <section className="store-cart-view" aria-label="Shopping cart and checkout">
            <div className="store-cart-actions">
              <button className="secondary-button store-continue-button" type="button" onClick={() => setCartOpen(false)}>
                Continue shopping
              </button>
            </div>
            <div id="store-cart" className="store-cart-panel" aria-label="Shopping cart and checkout">
            <div className="store-cart-header">
              <div>
                <p className="store-kicker">Cart</p>
                <h2>Order summary</h2>
              </div>
              <strong>{cartCount}</strong>
            </div>

            {cartLines.length ? (
              <div className="store-cart-lines">
                {cartLines.map((item) => {
                  const itemKey = cartKey(item);
                  const maxLineQuantity = remainingInventoryForProduct(item.product, cartItems, itemKey);

                  return (
                    <div className="store-cart-line" key={itemKey}>
                      {item.product.imageSrc ? (
                        <img src={item.product.imageSrc} alt="" aria-hidden="true" />
                      ) : (
                        <span className="store-cart-line-placeholder" aria-hidden="true">
                          Preview unavailable for now
                        </span>
                      )}
                      <div>
                        <h3>{item.product.name}</h3>
                        <p>
                          {item.size} / {item.color}
                        </p>
                        <strong>{formatPrice(typeof item.product.price === "number" ? item.product.price * item.quantity : undefined)}</strong>
                      </div>
                      <div className="store-quantity-control" aria-label={`${item.product.name} quantity`}>
                        <button type="button" onClick={() => updateCartQuantity(item, item.product, item.quantity - 1)} aria-label="Decrease quantity">
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item, item.product, item.quantity + 1)}
                          aria-label="Increase quantity"
                          disabled={item.quantity >= maxLineQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="store-empty-cart">Your cart is empty.</p>
            )}

            <dl className="store-total-list">
              <div>
                <dt>Subtotal</dt>
                <dd>{typeof subtotal === "number" ? formatMoney(subtotal) : cartLines.length ? "TBD" : "$0.00"}</dd>
              </div>
              <div>
                <dt>Fulfillment</dt>
                <dd>Event pickup</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>Due at pickup</dd>
              </div>
              <div className="store-total-row">
                <dt>Total</dt>
                <dd>{typeof total === "number" ? formatMoney(total) : cartLines.length ? "TBD" : "$0.00"}</dd>
              </div>
            </dl>

            <form className="store-checkout-form" onSubmit={handleCheckout}>
              <h2>Checkout</h2>
              <label>
                Name
                <input required type="text" name="name" autoComplete="name" />
              </label>
              <label>
                Email
                <input required type="email" name="email" autoComplete="email" />
              </label>
              <label>
                Phone
                <input type="tel" name="phone" autoComplete="tel" />
              </label>
              <p className="store-checkout-note">Event pickup only. No payment is collected now.</p>
              <button className="primary-button store-checkout-button" type="submit" disabled={!cartItems.length || isCheckoutSubmitting}>
                {isCheckoutSubmitting ? "Reserving..." : "Reserve for pickup"}
              </button>
              {checkoutError ? (
                <p className="store-checkout-error" role="alert">
                  {checkoutError}
                </p>
              ) : null}
              {checkoutComplete && checkoutStatus ? (
                <p className="store-checkout-status" role="status">
                  {checkoutStatus}
                </p>
              ) : null}
            </form>
            </div>
          </section>
        )}
      </main>

      {redirectDialogOpen
        ? createPortal(
        <div className="store-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="store-confirm-title">
          <div className="store-confirm-dialog">
            <p className="store-kicker">Leaving store</p>
            <h2 id="store-confirm-title">Go back to main website?</h2>
            <p>This will redirect you back to the main website.</p>
            <div className="store-confirm-actions">
              <button className="secondary-button" type="button" onClick={() => setRedirectDialogOpen(false)}>
                Cancel
              </button>
              <button className="primary-button" type="button" onClick={() => (window.location.href = "/#connect")}>
                Continue
              </button>
            </div>
          </div>
        </div>,
            document.body
          )
        : null}

      {previewProduct ? (
        <div
          className="store-image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${previewProduct.name} full image`}
          onClick={() => setPreviewProduct(null)}
        >
          <div className="store-image-viewer-shell" onClick={(event) => event.stopPropagation()} tabIndex={-1} autoFocus>
            <button className="store-image-viewer-close" type="button" onClick={() => setPreviewProduct(null)}>
              Close
            </button>
            {previewProduct.imageSrc ? <img src={previewProduct.imageSrc} alt={previewProduct.imageAlt} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
