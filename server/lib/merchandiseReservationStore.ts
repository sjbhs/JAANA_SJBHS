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
  merchandisePriceFor,
  type MerchandiseInventorySku,
  type MerchandiseSku
} from "../../src/site/merchandiseInventory.js";

export type MerchandiseInventoryRow = {
  sku: MerchandiseSku;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  price: number;
};

export type MerchandiseReservationItem = {
  id?: string;
  sku: MerchandiseSku;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
};

export type MerchandisePaymentSummary = {
  currency: "USD";
  subtotal: number;
  total: number;
  items: Array<{
    sku: MerchandiseSku;
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export type MerchandiseReservationOrder = MerchandiseReservationEntry & {
  updatedAt?: string;
};

export type MerchandiseCancellationPayload = {
  reservationId?: string;
  itemId?: string;
  quantity?: number;
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

export type MerchandiseInventoryQuantityPayload = {
  sku?: string;
  totalQuantity?: number;
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
  paymentSummary?: MerchandisePaymentSummary;
};

type ReservationResult = {
  reservation: MerchandiseReservationEntry;
  inventory: MerchandiseInventoryRow[];
  paymentSummary: MerchandisePaymentSummary;
  storage: "local-json" | "supabase";
};

type CancellationResult = {
  reservation: MerchandiseReservationOrder;
  orders: MerchandiseReservationOrder[];
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
const supabaseRequestTimeoutMs = Math.min(
  Math.max(Number(process.env.MERCHANDISE_SUPABASE_TIMEOUT_MS ?? 8000), 1000),
  30000
);

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

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizedMoney(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue >= 0 ? roundCurrency(numberValue) : null;
}

function serverUnitPriceFor(item: MerchandiseReservationItem) {
  const explicitUnitPrice = normalizedMoney(item.unitPrice);

  if (explicitUnitPrice !== null) {
    return explicitUnitPrice;
  }

  if (isInventorySku(item.sku) || isBundleSku(item.sku)) {
    return roundCurrency(merchandisePriceFor(item.sku));
  }

  return 0;
}

function withServerComputedPricing(item: MerchandiseReservationItem): MerchandiseReservationItem {
  const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0;
  const unitPrice = serverUnitPriceFor(item);

  return {
    ...item,
    unitPrice,
    lineTotal: roundCurrency(unitPrice * quantity)
  };
}

export function buildMerchandisePaymentSummary(items: MerchandiseReservationItem[]): MerchandisePaymentSummary {
  const summaryItems = items.map((item) => {
    const pricedItem = withServerComputedPricing(item);

    return {
      sku: pricedItem.sku,
      name: pricedItem.name,
      size: pricedItem.size,
      color: pricedItem.color,
      quantity: pricedItem.quantity,
      unitPrice: pricedItem.unitPrice ?? 0,
      lineTotal: pricedItem.lineTotal ?? 0
    };
  });
  const subtotal = roundCurrency(summaryItems.reduce((total, item) => total + item.lineTotal, 0));

  return {
    currency: "USD",
    subtotal,
    total: subtotal,
    items: summaryItems
  };
}

function withPaymentSummary<T extends MerchandiseReservationEntry>(
  reservation: T
): T & { paymentSummary: MerchandisePaymentSummary } {
  const items = reservation.items.map(withServerComputedPricing);

  return {
    ...reservation,
    items,
    paymentSummary: buildMerchandisePaymentSummary(items)
  };
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
      availableQuantity: Math.max(product.quantity - reservedQuantity, 0),
      price: product.price
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
      availableQuantity,
      price: bundle.price
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

    return parsed
      .filter((entry): entry is MerchandiseReservationEntry => {
        return (
          typeof entry?.id === "string" &&
          typeof entry.createdAt === "string" &&
          typeof entry.customer?.name === "string" &&
          typeof entry.customer.email === "string" &&
          Array.isArray(entry.items)
        );
      })
      .map(withPaymentSummary);
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

    return withServerComputedPricing({
      sku: sku as MerchandiseSku,
      name: merchandiseNameFor(sku as MerchandiseSku),
      size: typeof item.size === "string" && item.size.trim() ? item.size.trim() : "Standard",
      color: typeof item.color === "string" && item.color.trim() ? item.color.trim() : "Default",
      quantity
    });
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
  const baseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), supabaseRequestTimeoutMs);
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Merchandise database check timed out. Please try again."
        : error instanceof Error
          ? `Unable to reach the merchandise database: ${error.message}`
          : "Unable to reach the merchandise database.";

    throw new MerchandiseReservationError(message, 503);
  } finally {
    clearTimeout(timeout);
  }

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

  const responseText = await response.text();

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

async function pingSupabaseDatabase() {
  await supabaseRequest<Record<string, unknown>[]>(
    "/rest/v1/merch_products?select=sku&limit=1",
    {
      method: "GET"
    }
  );
}

export async function pingMerchandiseDatabase() {
  if (isSupabaseConfigured()) {
    await pingSupabaseDatabase();

    return {
      ok: true,
      storage: "supabase" as const
    };
  }

  if (process.env.VERCEL) {
    throw new MerchandiseReservationError(
      "Merchandise database is not configured for this deployment.",
      503
    );
  }

  return {
    ok: true,
    storage: "local-json" as const
  };
}

function normalizeSupabaseInventoryRow(row: Record<string, unknown>): MerchandiseInventoryRow {
  return {
    sku: String(row.sku) as MerchandiseSku,
    name: String(row.name),
    totalQuantity: Number(row.total_quantity ?? row.totalQuantity ?? 0),
    reservedQuantity: Number(row.reserved_quantity ?? row.reservedQuantity ?? 0),
    availableQuantity: Number(row.available_quantity ?? row.availableQuantity ?? 0),
    price: Number(row.price_usd ?? row.price ?? 0)
  };
}

function normalizeSupabaseReservationRow(row: Record<string, unknown>): MerchandiseReservationOrder {
  const rawItems = Array.isArray(row.merch_reservation_items) ? row.merch_reservation_items : [];

  return withPaymentSummary({
    id: String(row.id),
    createdAt: String(row.created_at ?? row.createdAt ?? ""),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined,
    status: String(row.status ?? "reserved") as MerchandiseReservationOrder["status"],
    customer: {
      name: String(row.customer_name ?? ""),
      email: String(row.customer_email ?? ""),
      ...(row.customer_phone ? { phone: String(row.customer_phone) } : {})
    },
    items: rawItems.map((item) =>
      withServerComputedPricing({
        id: String((item as Record<string, unknown>).id),
        sku: String((item as Record<string, unknown>).sku) as MerchandiseSku,
        name: String((item as Record<string, unknown>).product_name ?? ""),
        size: String((item as Record<string, unknown>).size ?? "Standard"),
        color: String((item as Record<string, unknown>).color ?? "Default"),
        quantity: Number((item as Record<string, unknown>).quantity ?? 0),
        unitPrice: Number(
          (item as Record<string, unknown>).unit_price_usd ?? (item as Record<string, unknown>).unitPrice ?? 0
        )
      })
    )
  });
}

async function readSupabaseInventory() {
  const rows = await supabaseRequest<Record<string, unknown>[]>(
    "/rest/v1/merchandise_inventory_summary?select=sku,name,total_quantity,reserved_quantity,available_quantity,price_usd&order=sku.asc",
    {
      method: "GET",
      headers: {
        Prefer: "return=representation"
      }
    }
  );

  return rows.map(normalizeSupabaseInventoryRow);
}

async function readSupabaseOrders() {
  const rows = await supabaseRequest<Record<string, unknown>[]>(
    "/rest/v1/merch_reservations?select=id,customer_name,customer_email,customer_phone,status,created_at,merch_reservation_items(id,sku,product_name,size,color,quantity,unit_price_usd)&order=created_at.desc&merch_reservation_items.order=sku.asc",
    {
      method: "GET",
      headers: {
        Prefer: "return=representation"
      }
    }
  );

  return rows.map(normalizeSupabaseReservationRow);
}

async function readSupabaseReservation(id: string) {
  const encodedId = encodeURIComponent(id);
  const rows = await supabaseRequest<Record<string, unknown>[]>(
    `/rest/v1/merch_reservations?select=id,customer_name,customer_email,customer_phone,status,created_at,merch_reservation_items(id,sku,product_name,size,color,quantity,unit_price_usd)&id=eq.${encodedId}&limit=1`,
    {
      method: "GET",
      headers: {
        Prefer: "return=representation"
      }
    }
  );

  return rows[0] ? normalizeSupabaseReservationRow(rows[0]) : null;
}

async function readSupabaseProduct(sku: MerchandiseSku) {
  const rows = await supabaseRequest<Record<string, unknown>[]>(
    `/rest/v1/merch_products?select=sku,name,total_quantity,product_type&sku=eq.${encodeURIComponent(sku)}&limit=1`,
    {
      method: "GET"
    }
  );

  return rows[0] ?? null;
}

function normalizeInventoryQuantityPayload(payload: MerchandiseInventoryQuantityPayload) {
  const sku = typeof payload?.sku === "string" ? payload.sku.trim() : "";
  const totalQuantity = Number(payload?.totalQuantity);

  if (!isInventorySku(sku)) {
    throw new MerchandiseReservationError(
      isBundleSku(sku)
        ? "Bundle quantities are calculated from their component inventory."
        : "Choose a valid merchandise item before updating quantity."
    );
  }

  if (!Number.isInteger(totalQuantity) || totalQuantity < 0) {
    throw new MerchandiseReservationError("Enter a whole number quantity of zero or more.");
  }

  return {
    sku,
    totalQuantity
  };
}

async function updateSupabaseInventoryQuantity(
  payload: MerchandiseInventoryQuantityPayload
) {
  const { sku, totalQuantity } = normalizeInventoryQuantityPayload(payload);

  await pingSupabaseDatabase();

  const product = await readSupabaseProduct(sku);

  if (!product) {
    throw new MerchandiseReservationError("Merchandise item not found.", 404);
  }

  if (String(product.product_type ?? "individual") !== "individual") {
    throw new MerchandiseReservationError("Only individual item quantities can be edited directly.");
  }

  const currentInventory = await readSupabaseInventory();
  const currentRow = currentInventory.find((row) => row.sku === sku);

  if (!currentRow) {
    throw new MerchandiseReservationError("Merchandise item is missing from inventory.", 404);
  }

  if (totalQuantity < currentRow.reservedQuantity) {
    throw new MerchandiseReservationError(
      `Quantity cannot be lower than ${currentRow.reservedQuantity}; those units are already reserved.`
    );
  }

  await supabaseRequest<Record<string, unknown>[]>(
    `/rest/v1/merch_products?sku=eq.${encodeURIComponent(sku)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        total_quantity: totalQuantity,
        updated_at: new Date().toISOString()
      })
    }
  );

  return {
    inventory: await readSupabaseInventory(),
    storage: "supabase" as const
  };
}

async function createSupabaseReservation(payload: MerchandiseReservationPayload): Promise<ReservationResult> {
  await pingSupabaseDatabase();

  const normalizedPayload = normalizeReservationPayload(payload);
  const result = await supabaseRequest<{
    reservation: MerchandiseReservationEntry;
    inventory: Record<string, unknown>[];
    paymentSummary?: MerchandisePaymentSummary;
  }>("/rest/v1/rpc/reserve_merchandise_order", {
    method: "POST",
    body: JSON.stringify({
      reservation_payload: normalizedPayload
    })
  });
  const reservation = withPaymentSummary(result.reservation);
  const paymentSummary = result.paymentSummary ?? reservation.paymentSummary;

  return {
    reservation: {
      ...reservation,
      paymentSummary
    },
    inventory: result.inventory.map(normalizeSupabaseInventoryRow),
    paymentSummary,
    storage: "supabase"
  };
}

async function cancelSupabaseReservation(payload: MerchandiseCancellationPayload): Promise<CancellationResult> {
  await pingSupabaseDatabase();

  const reservationId = typeof payload.reservationId === "string" ? payload.reservationId.trim() : "";
  const itemId = typeof payload.itemId === "string" ? payload.itemId.trim() : "";
  const quantity = Number(payload.quantity);

  if (!reservationId) {
    throw new MerchandiseReservationError("Choose an order before cancelling.");
  }

  const reservation = await readSupabaseReservation(reservationId);

  if (!reservation) {
    throw new MerchandiseReservationError("Order not found.", 404);
  }

  if (reservation.status !== "reserved") {
    throw new MerchandiseReservationError("Only active reserved orders can be cancelled.");
  }

  if (!itemId) {
    await supabaseRequest<Record<string, unknown>[]>(
      `/rest/v1/merch_reservations?id=eq.${encodeURIComponent(reservationId)}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          status: "cancelled"
        })
      }
    );
  } else {
    const item = reservation.items.find((candidate) => candidate.id === itemId);

    if (!item) {
      throw new MerchandiseReservationError("Order item not found.", 404);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new MerchandiseReservationError("Enter a valid cancellation quantity.");
    }

    if (quantity > item.quantity) {
      throw new MerchandiseReservationError(`Only ${item.quantity} ${item.name} can be cancelled from this order.`);
    }

    if (quantity === item.quantity) {
      await supabaseRequest<unknown>(
        `/rest/v1/merch_reservation_items?id=eq.${encodeURIComponent(itemId)}`,
        {
          method: "DELETE"
        }
      );
    } else {
      await supabaseRequest<Record<string, unknown>[]>(
        `/rest/v1/merch_reservation_items?id=eq.${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: {
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            quantity: item.quantity - quantity
          })
        }
      );
    }

    const updatedReservation = await readSupabaseReservation(reservationId);

    if (!updatedReservation || updatedReservation.items.length === 0) {
      await supabaseRequest<Record<string, unknown>[]>(
        `/rest/v1/merch_reservations?id=eq.${encodeURIComponent(reservationId)}`,
        {
          method: "PATCH",
          headers: {
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            status: "cancelled"
          })
        }
      );
    }
  }

  const updated = await readSupabaseReservation(reservationId);
  const orders = await readSupabaseOrders();

  return {
    reservation: updated ?? reservation,
    orders,
    inventory: await readSupabaseInventory(),
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
  const reservationWithSummary = withPaymentSummary(reservation);

  reservations.unshift(reservationWithSummary);
  await writeLocalReservations(reservations);

  return {
    reservation: reservationWithSummary,
    inventory: getInitialInventoryRows(reservations),
    paymentSummary: reservationWithSummary.paymentSummary,
    storage: "local-json"
  };
}

async function cancelLocalReservation(payload: MerchandiseCancellationPayload): Promise<CancellationResult> {
  const reservationId = typeof payload.reservationId === "string" ? payload.reservationId.trim() : "";
  const itemId = typeof payload.itemId === "string" ? payload.itemId.trim() : "";
  const quantity = Number(payload.quantity);

  if (!reservationId) {
    throw new MerchandiseReservationError("Choose an order before cancelling.");
  }

  const reservations = await readLocalReservations();
  const reservationIndex = reservations.findIndex((reservation) => reservation.id === reservationId);

  if (reservationIndex < 0) {
    throw new MerchandiseReservationError("Order not found.", 404);
  }

  const reservation = reservations[reservationIndex];

  if (reservation.status !== "reserved") {
    throw new MerchandiseReservationError("Only active reserved orders can be cancelled.");
  }

  const itemsWithIds = reservation.items.map((item, index) => ({
    ...item,
    id: item.id ?? `${reservation.id}:${index}`
  }));

  if (!itemId) {
    reservations[reservationIndex] = {
      ...reservation,
      status: "cancelled",
      items: itemsWithIds
    };
  } else {
    const itemIndex = itemsWithIds.findIndex((item) => item.id === itemId);

    if (itemIndex < 0) {
      throw new MerchandiseReservationError("Order item not found.", 404);
    }

    const item = itemsWithIds[itemIndex];

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new MerchandiseReservationError("Enter a valid cancellation quantity.");
    }

    if (quantity > item.quantity) {
      throw new MerchandiseReservationError(`Only ${item.quantity} ${item.name} can be cancelled from this order.`);
    }

    const nextItems =
      quantity === item.quantity
        ? itemsWithIds.filter((candidate) => candidate.id !== itemId)
        : itemsWithIds.map((candidate) =>
            candidate.id === itemId
              ? {
                  ...candidate,
                  quantity: candidate.quantity - quantity
                }
              : candidate
          );

    reservations[reservationIndex] = {
      ...reservation,
      status: nextItems.length ? reservation.status : "cancelled",
      items: nextItems
    };
  }

  reservations[reservationIndex] = withPaymentSummary(reservations[reservationIndex]);
  await writeLocalReservations(reservations);

  const updatedReservation = reservations[reservationIndex] as MerchandiseReservationOrder;

  return {
    reservation: updatedReservation,
    orders: reservations.map((reservation) => withPaymentSummary(reservation)),
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

export async function readMerchandiseOrders() {
  if (isSupabaseConfigured()) {
    return {
      orders: await readSupabaseOrders(),
      storage: "supabase" as const
    };
  }

  if (process.env.VERCEL) {
    return {
      orders: [] as MerchandiseReservationOrder[],
      storage: "static" as const
    };
  }

  const reservations = await readLocalReservations();

  return {
    orders: reservations.map((reservation) =>
      withPaymentSummary({
        ...reservation,
        items: reservation.items.map((item, index) => ({
          ...item,
          id: item.id ?? `${reservation.id}:${index}`
        }))
      })
    ),
    storage: "local-json" as const
  };
}

export async function cancelMerchandiseReservation(payload: MerchandiseCancellationPayload) {
  if (isSupabaseConfigured()) {
    return cancelSupabaseReservation(payload);
  }

  if (process.env.VERCEL) {
    throw new MerchandiseReservationError(
      "Merchandise cancellations need a configured database before deployment.",
      503
    );
  }

  return cancelLocalReservation(payload);
}

export async function updateMerchandiseInventoryQuantity(payload: MerchandiseInventoryQuantityPayload) {
  if (isSupabaseConfigured()) {
    return updateSupabaseInventoryQuantity(payload);
  }

  throw new MerchandiseReservationError(
    "Merchandise inventory quantity updates need a configured database.",
    503
  );
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
