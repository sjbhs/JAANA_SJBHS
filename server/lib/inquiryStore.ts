import fs from "node:fs/promises";
import path from "node:path";

export type InquiryEntry = {
  id: string;
  name: string;
  email: string;
  organization: string;
  interest: string;
  notes: string;
  createdAt: string;
};

type NewInquiryEntry = Omit<InquiryEntry, "id" | "createdAt">;

const defaultStoragePath = path.resolve(process.cwd(), "server/data/inquiries.json");
const temporaryStoragePath = path.join(process.env.TMPDIR ?? "/tmp", "jaana-sjbhs-inquiries.json");

function getStoragePath() {
  const configuredPath =
    process.env.INQUIRY_STORAGE_PATH?.trim() ?? process.env.WAITLIST_STORAGE_PATH?.trim();

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
    await fs.writeFile(storagePath, "[]\n", "utf8");
  }

  return storagePath;
}

async function readEntries() {
  const storagePath = await ensureStorage();
  const raw = await fs.readFile(storagePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as InquiryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeEntries(entries: InquiryEntry[]) {
  const storagePath = await ensureStorage();
  await fs.writeFile(storagePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

export async function createInquiry(entry: NewInquiryEntry) {
  const entries = await readEntries();
  const nextEntry: InquiryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    ...entry
  };

  entries.unshift(nextEntry);
  await writeEntries(entries);

  return {
    entry: nextEntry,
    total: entries.length
  };
}

export async function getInquiryStats() {
  const entries = await readEntries();

  return {
    total: entries.length
  };
}

export async function getRecentInquiries(limit = 10) {
  const entries = await readEntries();

  return {
    total: entries.length,
    inquiries: entries.slice(0, Math.max(0, limit))
  };
}
