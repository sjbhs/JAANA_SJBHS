import fs from "node:fs/promises";
import path from "node:path";
import { defaultMerchandiseImages } from "../../src/site/merchandiseImages.js";
import { isBundleSku, isInventorySku, type MerchandiseSku } from "../../src/site/merchandiseInventory.js";

export type MerchandiseImageRecord = {
  sku: MerchandiseSku;
  imageSrc: string | null;
  updatedAt?: string;
};

type MerchandiseImageStore = {
  images: Partial<Record<MerchandiseSku, MerchandiseImageRecord>>;
};

type MerchandiseImageUploadPayload = {
  sku?: string;
  fileName?: string;
  mimeType?: string;
  dataUrl?: string;
};

const imageStorePath = path.resolve(process.cwd(), "server/data/merchandise-images.json");
const uploadDirectory = path.resolve(process.cwd(), "public/assets/merchandise/uploads");
const uploadPublicPath = "/assets/merchandise/uploads";
const maxUploadBytes = 6 * 1024 * 1024;
const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

function normalizeSku(value: unknown) {
  const sku = typeof value === "string" ? value.trim() : "";

  if (!isInventorySku(sku) && !isBundleSku(sku)) {
    throw new Error("Choose a valid merchandise item before updating the image.");
  }

  return sku as MerchandiseSku;
}

function sanitizeFileSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function ensureImageStore() {
  await fs.mkdir(path.dirname(imageStorePath), { recursive: true });

  try {
    await fs.access(imageStorePath);
  } catch {
    await fs.writeFile(imageStorePath, `${JSON.stringify({ images: {} }, null, 2)}\n`, "utf8");
  }
}

async function readImageStore(): Promise<MerchandiseImageStore> {
  await ensureImageStore();

  try {
    const raw = await fs.readFile(imageStorePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<MerchandiseImageStore>;

    return {
      images: parsed.images && typeof parsed.images === "object" ? parsed.images : {}
    };
  } catch {
    return { images: {} };
  }
}

async function writeImageStore(store: MerchandiseImageStore) {
  await fs.mkdir(path.dirname(imageStorePath), { recursive: true });
  await fs.writeFile(imageStorePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function uploadedPathFor(src: string | null | undefined) {
  if (!src?.startsWith(`${uploadPublicPath}/`)) {
    return "";
  }

  return path.resolve(process.cwd(), "public", src.replace(/^\//, ""));
}

async function removeUploadedFile(src: string | null | undefined) {
  const filePath = uploadedPathFor(src);

  if (!filePath || !filePath.startsWith(uploadDirectory)) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore already-missing uploads.
  }
}

export async function readMerchandiseImages() {
  const store = await readImageStore();
  const skus = new Set<MerchandiseSku>([
    ...(Object.keys(defaultMerchandiseImages) as MerchandiseSku[]),
    ...(Object.keys(store.images) as MerchandiseSku[])
  ]);

  return Array.from(skus)
    .sort()
    .map((sku) => {
      const override = store.images[sku];

      if (override) {
        return override;
      }

      return {
        sku,
        imageSrc: defaultMerchandiseImages[sku] ?? null
      };
    });
}

export async function readMerchandiseImageMap() {
  const images = await readMerchandiseImages();

  return images.reduce<Partial<Record<MerchandiseSku, string | null>>>((map, image) => {
    map[image.sku] = image.imageSrc;
    return map;
  }, {});
}

export async function uploadMerchandiseImage(payload: MerchandiseImageUploadPayload) {
  const sku = normalizeSku(payload.sku);
  const mimeType = typeof payload.mimeType === "string" ? payload.mimeType.trim().toLowerCase() : "";
  const extension = allowedMimeTypes.get(mimeType);
  const dataUrl = typeof payload.dataUrl === "string" ? payload.dataUrl : "";
  const dataPrefix = `data:${mimeType};base64,`;

  if (!extension || !dataUrl.startsWith(dataPrefix)) {
    throw new Error("Upload a JPG, PNG, WEBP, or GIF image.");
  }

  const base64 = dataUrl.slice(dataPrefix.length);
  const buffer = Buffer.from(base64, "base64");

  if (!buffer.length || buffer.length > maxUploadBytes) {
    throw new Error("Upload an image smaller than 6 MB.");
  }

  const store = await readImageStore();
  const previous = store.images[sku]?.imageSrc;
  const fileStem = sanitizeFileSegment(payload.fileName ?? sku) || sku.toLowerCase();
  const fileName = `${sku.toLowerCase()}-${Date.now()}-${fileStem}.${extension}`;

  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(path.join(uploadDirectory, fileName), buffer);
  await removeUploadedFile(previous);

  const record = {
    sku,
    imageSrc: `${uploadPublicPath}/${fileName}`,
    updatedAt: new Date().toISOString()
  };

  store.images[sku] = record;
  await writeImageStore(store);

  return record;
}

export async function clearMerchandiseImage(skuValue: string) {
  const sku = normalizeSku(skuValue);
  const store = await readImageStore();

  await removeUploadedFile(store.images[sku]?.imageSrc);

  const record = {
    sku,
    imageSrc: null,
    updatedAt: new Date().toISOString()
  };

  store.images[sku] = record;
  await writeImageStore(store);

  return record;
}
