import fs from "node:fs/promises";
import path from "node:path";
import {
  componentsForMerchandiseSku,
  initialQuantityFor,
  isBundleSku,
  isInventorySku,
  merchandiseBundleDatabase,
  merchandiseInventoryDatabase,
  merchandiseNameFor,
  type MerchandiseInventorySku,
  type MerchandiseSku
} from "../../src/site/merchandiseInventory.js";

export type MerchandiseInventoryRow = {
  sku: MerchandiseSku;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
};

export type MerchandiseReservationItem = {
  sku: MerchandiseSku;
  name: string;
  size: string;
  color: string;
  quantity: number;
};

export type MerchandiseReservationPayload = {
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    sku: string;
    size?: string;
    color?: string;
    quantity?: number;
  }>;
};

export type MerchandiseReservationEntry = {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  status: "reserved" | "cancelled" | "fulfilled";
  items: MerchandiseReservationItem[];
};

type ReservationResult = {
  reservation: MerchandiseReservationEntry;
  inventory: MerchandiseInventoryRow[];
  storage: "local-json" | "supabase";
};

const defaultStoragePath = path.resolve(process.cwd(), "server/data/merchandise-reservations.json");
const temporaryStoragePath = path.join(process.env.TMPDIR ?? "/tmp", "jaana-sjbhs-merchandise-reservations.json");
const supabaseUrl = process.env.MERCHANDISE_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim() || "";
const supabaseServiceRoleKey =
  process.env.MERCHANDISE_SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  "";

export class MerchandiseReservationError extends Error {
  statusCode: number;
  inventory?: MerchandiseInventoryRow[];

  constructor(message: string, statusCode = 400, inventory?: MerchandiseInventoryRow[]) {
    super(message);
    this.name = "MerchandiseReservationError";
    this.statusCode = statusCode;
    this.inventory = inventory;
  }
}

function getReservationStoragePath() {
  const configuredPath = process.env.MERCHANDISE_STORAGE_PATH?.trim();

  if (configuredPath) {
    const resolvedPath = path.resolve(process.cwd(), configuredPath);

    if (process.env.VERCEL && !resolvedPath.startsWith("/tmp/")) {
      return temporaryStoragePath;
    }

    return resolvedPath;
  }

  return process.env.VERCEL ? temporaryStoragePath : defaultStoragePath;
}

function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function expandReservationItemsToComponents(items: MerchandiseReservationItem[]) {
  return items.reduce<Partial<Record<MerchandiseInventorySku, number>>>((totals, item) => {
    for (const component of componentsForMerchandiseSku(item.sku)) {
      totals[component.sku] = (totals[component.sku] ?? 0) + component.quantity * item.quantity;
    }

    return totals;
  }, {});
}

function reservedComponentsFromReservations(reservations: MerchandiseReservationEntry[]) {
  const reservedItems = reservations
    .filter((reservation) => reservation.status === "reserved")
    .flatMap((reservation) => reservation.items);

  return expandReservationItemsToComponents(reservedItems);
}

function bundleAvailableQuantity(
  sku: MerchandiseSku,
  inventoryRows: MerchandiseInventoryRow[]
) {
  const components = componentsForMerchandiseSku(sku);

  return Math.max(
    Math.min(
      ...components.map((component) => {
        const row = inventoryRows.find((candidate) => candidate.sku === component.sku);
        const availableQuantity = row?.availableQuantity ?? merchandiseInventoryDatabase[component.sku].quantity;

        return Math.floor(availableQuantity / component.quantity);
      })
    ),
    0
  );
}

function getInitialInventoryRows(reservations: MerchandiseReservationEntry[] = []): MerchandiseInventoryRow[] {
  const reservedByComponent = reservedComponentsFromReservations(reservations);
  const inventoryRows = Object.entries(merchandiseInventoryDatabase).map(([sku, product]) => {
    const reservedQuantity = reservedByComponent[sku as MerchandiseInventorySku] ?? 0;

    return {
      sku: sku as MerchandiseSku,
      name: product.name,
      totalQuantity: product.quantity,
      reservedQuantity,
      availableQuantity: Math.max(product.quantity - reservedQuantity, 0)
    };
  });

  const bundleRows = Object.entries(merchandiseBundleDatabase).map(([sku, bundle]) => {
    const reservationQuantity = reservations
      .filter((reservation) => reservation.status === "reserved")
      .flatMap((reservation) => reservation.items)
      .filter((item) => item.sku === sku)
      .reduce((total, item) => total + item.quantity, 0);
    const availableQuantity = bundleAvailableQuantity(sku as MerchandiseSku, inventoryRows);

    return {
      sku: sku as MerchandiseSku,
      name: bundle.name,
      totalQuantity: initialQuantityFor(sku as MerchandiseSku),
      reservedQuantity: reservationQuantity,
      availableQuantity
    };
  });

  return [...inventoryRows, ...bundleRows];
}

async function ensureLocalStorage() {
  const storagePath = getReservationStoragePath();

  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch {
    await fs.writeFile(storagePath, "[]\n", "utf8");
  }

  return storagePath;
}

async function readLocalReservations() {
  const storagePath = await ensureLocalStorage();
  const raw = await fs.readFile(storagePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<MerchandiseReservationEntry>[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is MerchandiseReservationEntry => {
      return (
        typeof entry?.id === "string" &&
        typeof entry.createdAt === "string" &&
        typeof entry.customer?.name === "string" &&
        typeof entry.customer.email === "string" &&
        Array.isArray(entry.items)
      );
    });
  } catch {
    return [];
  }
}

async function writeLocalReservations(entries: MerchandiseReservationEntry[]) {
  const storagePath = await ensureLocalStorage();

  await fs.writeFile(storagePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

function normalizeReservationPayload(payload: MerchandiseReservationPayload) {
  const name = typeof payload?.customer?.name === "string" ? payload.customer.name.trim() : "";
  const email = typeof payload?.customer?.email === "string" ? payload.customer.email.trim().toLowerCase() : "";
  const phone = typeof payload?.customer?.phone === "string" ? payload.customer.phone.trim() : "";

  if (!name) {
    throw new MerchandiseReservationError("Enter your name before reserving merchandise.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new MerchandiseReservationError("Enter a valid email before reserving merchandise.");
  }

  if (!Array.isArray(payload.items) || !payload.items.length) {
    throw new MerchandiseReservationError("Add at least one item before placing an order.");
  }

  const items = payload.items.map((item) => {
    const sku = typeof item.sku === "string" ? item.sku.trim() : "";
    const productExists = isInventorySku(sku) || isBundleSku(sku);
    const quantity = Number(item.quantity);

    if (!productExists) {
      throw new MerchandiseReservationError("One of the selected products is no longer available.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new MerchandiseReservationError(`Enter a valid quantity for ${merchandiseNameFor(sku as MerchandiseSku)}.`);
    }

    return {
      sku: sku as MerchandiseSku,
      name: merchandiseNameFor(sku as MerchandiseSku),
      size: typeof item.size === "string" && item.size.trim() ? item.size.trim() : "Standard",
      color: typeof item.color === "string" && item.color.trim() ? item.color.trim() : "Default",
      quantity
    };
  });

  return {
    customer: {
      name,
      email,
      ...(phone ? { phone } : {})
    },
    items
  };
}

async function supabaseRequest<T>(endpoint: string, init: RequestInit = {}) {
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body || "Unable to reach the merchandise database.";

    try {
      const parsed = JSON.parse(body) as { message?: unknown };

      if (typeof parsed.message === "string" && parsed.message.trim()) {
        message = parsed.message;
      }
    } catch {
      // Keep the plain response body.
    }

    throw new MerchandiseReservationError(message, response.status);
  }

  return (await response.json()) as T;
}

function normalizeSupabaseInventoryRow(row: Record<string, unknown>): MerchandiseInventoryRow {
  return {
    sku: String(row.sku) as MerchandiseSku,
    name: String(row.name),
    totalQuantity: Number(row.total_quantity ?? row.totalQuantity ?? 0),
    reservedQuantity: Number(row.reserved_quantity ?? row.reservedQuantity ?? 0),
    availableQuantity: Number(row.available_quantity ?? row.availableQuantity ?? 0)
  };
}

async function readSupabaseInventory() {
  const rows = await supabaseRequest<Record<string, unknown>[]>(
    "/rest/v1/merchandise_inventory_summary?select=sku,name,total_quantity,reserved_quantity,available_quantity&order=sku.asc",
    {
      method: "GET",
      headers: {
        Prefer: "return=representation"
      }
    }
  );

  return rows.map(normalizeSupabaseInventoryRow);
}

async function createSupabaseReservation(payload: MerchandiseReservationPayload): Promise<ReservationResult> {
  const normalizedPayload = normalizeReservationPayload(payload);
  const result = await supabaseRequest<{
    reservation: MerchandiseReservationEntry;
    inventory: Record<string, unknown>[];
  }>("/rest/v1/rpc/reserve_merchandise_order", {
    method: "POST",
    body: JSON.stringify({
      reservation_payload: normalizedPayload
    })
  });

  return {
    reservation: result.reservation,
    inventory: result.inventory.map(normalizeSupabaseInventoryRow),
    storage: "supabase"
  };
}

async function createLocalReservation(payload: MerchandiseReservationPayload): Promise<ReservationResult> {
  const normalizedPayload = normalizeReservationPayload(payload);
  const reservations = await readLocalReservations();
  const inventory = getInitialInventoryRows(reservations);
  const requestedBySku = expandReservationItemsToComponents(normalizedPayload.items);

  for (const [sku, quantity] of Object.entries(requestedBySku)) {
    const row = inventory.find((candidate) => candidate.sku === sku);

    if (!row || quantity > row.availableQuantity) {
      throw new MerchandiseReservationError(
        row
          ? `Only ${row.availableQuantity} ${row.name} ${row.availableQuantity === 1 ? "is" : "are"} left.`
          : "One selected product is unavailable.",
        409,
        inventory
      );
    }
  }

  const reservation: MerchandiseReservationEntry = {
    id: `MERCH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "reserved",
    customer: normalizedPayload.customer,
    items: normalizedPayload.items
  };

  reservations.unshift(reservation);
  await writeLocalReservations(reservations);

  return {
    reservation,
    inventory: getInitialInventoryRows(reservations),
    storage: "local-json"
  };
}

export async function readMerchandiseInventory() {
  if (isSupabaseConfigured()) {
    return {
      inventory: await readSupabaseInventory(),
      storage: "supabase" as const
    };
  }

  if (process.env.VERCEL) {
    return {
      inventory: getInitialInventoryRows(),
      storage: "static" as const
    };
  }

  const reservations = await readLocalReservations();

  return {
    inventory: getInitialInventoryRows(reservations),
    storage: "local-json" as const
  };
}

export async function createMerchandiseReservation(payload: MerchandiseReservationPayload) {
  if (isSupabaseConfigured()) {
    return createSupabaseReservation(payload);
  }

  if (process.env.VERCEL) {
    throw new MerchandiseReservationError(
      "Merchandise reservations need a configured database before deployment.",
      503
    );
  }

  return createLocalReservation(payload);
}
