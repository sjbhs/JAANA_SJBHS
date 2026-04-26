import fs from "node:fs/promises";
import path from "node:path";

export type InquiryEntry = {
  id: string;
  name: string;
  email: string;
  organization: string;
  interest: string;
  phone?: string;
  notes: string;
  createdAt: string;
  replyStatus: "pending" | "complete";
  completedAt?: string;
};

type NewInquiryEntry = Pick<InquiryEntry, "name" | "email" | "organization" | "interest" | "phone" | "notes">;
type InquiryListOptions = {
  limit?: number | null;
  from?: string;
  to?: string;
  replyStatuses?: InquiryEntry["replyStatus"][];
  interests?: string[];
};

const defaultStoragePath = path.resolve(process.cwd(), "server/data/inquiries.json");
const temporaryStoragePath = path.join(process.env.TMPDIR ?? "/tmp", "jaana-sjbhs-inquiries.json");

function getStoragePath() {
  const configuredPath =
    process.env.INQUIRY_STORAGE_PATH?.trim() ?? process.env.WAITLIST_STORAGE_PATH?.trim();

  if (configuredPath) {
    const resolvedPath = path.resolve(process.cwd(), configuredPath);

    if (process.env.VERCEL && !resolvedPath.startsWith("/tmp/")) {
      return temporaryStoragePath;
    }

    return resolvedPath;
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
    const parsed = JSON.parse(raw) as Partial<InquiryEntry>[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    const entries: InquiryEntry[] = [];

    for (const entry of parsed) {
      if (
        typeof entry?.id !== "string" ||
        typeof entry.name !== "string" ||
        typeof entry.email !== "string" ||
        typeof entry.organization !== "string" ||
        typeof entry.interest !== "string" ||
        typeof entry.notes !== "string" ||
        typeof entry.createdAt !== "string"
      ) {
        continue;
      }

      entries.push({
        id: entry.id,
        name: entry.name,
        email: entry.email,
        organization: entry.organization,
        interest: entry.interest,
        phone: typeof entry.phone === "string" ? entry.phone : undefined,
        notes: entry.notes,
        createdAt: entry.createdAt,
        replyStatus: entry.replyStatus === "complete" ? "complete" : "pending",
        completedAt: typeof entry.completedAt === "string" ? entry.completedAt : undefined
      });
    }

    return entries;
  } catch {
    return [];
  }
}

async function writeEntries(entries: InquiryEntry[]) {
  const storagePath = await ensureStorage();
  await fs.writeFile(storagePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

function parseDateBoundary(value: string | undefined, boundary: "start" | "end") {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.trim();
  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(normalized);
  const parsed = new Date(dateOnlyMatch ? `${normalized}T00:00:00.000Z` : normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (dateOnlyMatch && boundary === "end") {
    parsed.setUTCDate(parsed.getUTCDate() + 1);
  }

  return parsed;
}

export async function createInquiry(entry: NewInquiryEntry) {
  const entries = await readEntries();
  const nextEntry: InquiryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    replyStatus: "pending",
    ...entry
  };

  entries.unshift(nextEntry);
  await writeEntries(entries);

  return {
    entry: nextEntry,
    total: entries.length
  };
}

export async function getRecentInquiries(limit = 10) {
  return getInquiries({ limit });
}

export async function getInquiries(options: InquiryListOptions = {}) {
  const entries = await readEntries();
  const start = parseDateBoundary(options.from, "start");
  const endExclusive = parseDateBoundary(options.to, "end");
  const replyStatuses = Array.isArray(options.replyStatuses) ? options.replyStatuses : [];
  const interests = Array.isArray(options.interests)
    ? options.interests.map((value) => value.trim()).filter(Boolean)
    : [];
  const filteredEntries = entries.filter((entry) => {
    const createdAt = new Date(entry.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }

    if (start && createdAt < start) {
      return false;
    }

    if (endExclusive && createdAt >= endExclusive) {
      return false;
    }

    if (replyStatuses.length && !replyStatuses.includes(entry.replyStatus)) {
      return false;
    }

    if (interests.length && !interests.includes(entry.interest)) {
      return false;
    }

    return true;
  });
  const normalizedLimit =
    typeof options.limit === "number" && Number.isFinite(options.limit) ? Math.max(0, Math.floor(options.limit)) : null;

  return {
    total: entries.length,
    filteredTotal: filteredEntries.length,
    inquiries: normalizedLimit === null ? filteredEntries : filteredEntries.slice(0, normalizedLimit)
  };
}

export async function updateInquiryReplyStatus(id: string, replyStatus: InquiryEntry["replyStatus"]) {
  const entries = await readEntries();
  const entryIndex = entries.findIndex((entry) => entry.id === id);

  if (entryIndex < 0) {
    return null;
  }

  const currentEntry = entries[entryIndex];
  const updatedEntry: InquiryEntry = {
    ...currentEntry,
    replyStatus,
    completedAt: replyStatus === "complete" ? new Date().toISOString() : undefined
  };

  entries[entryIndex] = updatedEntry;
  await writeEntries(entries);

  return updatedEntry;
}

export async function deleteInquiry(id: string) {
  const entries = await readEntries();
  const nextEntries = entries.filter((entry) => entry.id !== id);

  if (nextEntries.length === entries.length) {
    return false;
  }

  await writeEntries(nextEntries);
  return true;
}
