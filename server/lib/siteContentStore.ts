import fs from "node:fs/promises";
import path from "node:path";
import { defaultSiteContent, normalizeSiteContent } from "../../src/site/siteContent.js";
import type { SiteContent } from "../../src/site/types.js";

const defaultStoragePath = path.resolve(process.cwd(), "server/data/site-content.json");
const temporaryStoragePath = path.join(process.env.TMPDIR ?? "/tmp", "jaana-sjbhs-site-content.json");

function getStoragePath() {
  const configuredPath = process.env.SITE_CONTENT_STORAGE_PATH?.trim();

  if (configuredPath) {
    return path.resolve(process.cwd(), configuredPath);
  }

  return process.env.VERCEL ? temporaryStoragePath : defaultStoragePath;
}

async function ensureStorage() {
  const storagePath = getStoragePath();
  const directory = path.dirname(storagePath);

  await fs.mkdir(directory, { recursive: true });

  try {
    await fs.access(storagePath);
  } catch {
    await fs.writeFile(storagePath, `${JSON.stringify(defaultSiteContent, null, 2)}\n`, "utf8");
  }

  return storagePath;
}

export async function readSiteContent(): Promise<SiteContent> {
  const storagePath = await ensureStorage();

  try {
    const raw = await fs.readFile(storagePath, "utf8");
    return normalizeSiteContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return defaultSiteContent;
  }
}

export async function writeSiteContent(content: Partial<SiteContent>) {
  const storagePath = await ensureStorage();
  const normalized = normalizeSiteContent(content);

  await fs.writeFile(storagePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  return normalized;
}

export function validateSiteContent(content: Partial<SiteContent>) {
  return {
    ok: true as const,
    data: normalizeSiteContent(content)
  };
}

export function getDefaultSiteContent() {
  return defaultSiteContent;
}
