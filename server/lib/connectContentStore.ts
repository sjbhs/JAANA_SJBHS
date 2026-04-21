import fs from "node:fs/promises";
import path from "node:path";

export type ConnectPageContent = {
  sponsorMessage: string;
  placeholders: {
    title: string;
    body: string;
  }[];
};

const defaultConnectSponsorMessage =
  "We are seeking sponsors for our North America Connect reunion, your brand/business will have the opportunity to reach hundreds of successful Josephites and their families. Proceeds from the event will fund the OBA Teachers Insurance program. Individual and batch benefactors are also warmly welcome.";

const defaultConnectContent: ConnectPageContent = {
  sponsorMessage: defaultConnectSponsorMessage,
  placeholders: [
    {
      title: "Registration",
      body: "Details coming soon."
    },
    {
      title: "Buy tickets",
      body: "Ticketing details will be published here once pricing, registration flow, and batch allocations are finalized."
    },
    {
      title: "Venue and lodging",
      body: "Venue confirmation, hotel block details, and local travel guidance for out-of-town attendees will be added here."
    },
    {
      title: "Weekend schedule",
      body: "The detailed Saturday and Sunday programme will be shared here as the event schedule is finalized."
    }
  ]
};

const defaultStoragePath = path.resolve(process.cwd(), "server/data/connect-page.json");
const temporaryStoragePath = path.join(process.env.TMPDIR ?? "/tmp", "jaana-sjbhs-connect-page.json");

function getStoragePath() {
  const configuredPath = process.env.CONNECT_CONTENT_STORAGE_PATH?.trim();

  if (configuredPath) {
    return path.resolve(process.cwd(), configuredPath);
  }

  return process.env.VERCEL ? temporaryStoragePath : defaultStoragePath;
}

function normalizeContent(value: Partial<ConnectPageContent>): ConnectPageContent {
  const fallback = defaultConnectContent;
  const placeholders = Array.isArray(value.placeholders) ? value.placeholders : fallback.placeholders;

  return {
    sponsorMessage:
      typeof value.sponsorMessage === "string" && value.sponsorMessage.trim()
        ? value.sponsorMessage.trim()
        : fallback.sponsorMessage,
    placeholders: placeholders.map((item, index) => ({
      title:
        typeof item?.title === "string" && item.title.trim()
          ? item.title.trim()
          : fallback.placeholders[index]?.title ?? "Details",
      body:
        typeof item?.body === "string" && item.body.trim()
          ? item.body.trim()
          : fallback.placeholders[index]?.body ?? "Details coming soon."
    }))
  };
}

async function ensureStorage() {
  const storagePath = getStoragePath();
  const directory = path.dirname(storagePath);

  await fs.mkdir(directory, { recursive: true });

  try {
    await fs.access(storagePath);
  } catch {
    await fs.writeFile(storagePath, `${JSON.stringify(defaultConnectContent, null, 2)}\n`, "utf8");
  }

  return storagePath;
}

export async function readConnectContent() {
  const storagePath = await ensureStorage();

  try {
    const raw = await fs.readFile(storagePath, "utf8");
    return normalizeContent(JSON.parse(raw) as Partial<ConnectPageContent>);
  } catch {
    return defaultConnectContent;
  }
}

export async function writeConnectContent(content: Partial<ConnectPageContent>) {
  const storagePath = await ensureStorage();
  const normalized = normalizeContent(content);

  await fs.writeFile(storagePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  return normalized;
}

export function validateConnectContent(content: Partial<ConnectPageContent>) {
  const normalized = normalizeContent(content);

  if (!normalized.placeholders.length) {
    return {
      ok: false as const,
      error: "At least one schedule item is required."
    };
  }

  return {
    ok: true as const,
    data: normalized
  };
}

export function getDefaultConnectContent() {
  return defaultConnectContent;
}
