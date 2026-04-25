type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function readHeaderValue(value: string | string[] | null | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return "";
}

function parseForwardedFor(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);
}

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getClientIpFromNodeHeaders(headers: Record<string, string | string[] | undefined>) {
  const forwardedFor = parseForwardedFor(readHeaderValue(headers["x-forwarded-for"]));

  return (
    forwardedFor ||
    readHeaderValue(headers["cf-connecting-ip"]) ||
    readHeaderValue(headers["x-real-ip"]) ||
    "unknown"
  );
}

export function getClientIpFromRequestHeaders(headers: Headers) {
  const forwardedFor = parseForwardedFor(headers.get("x-forwarded-for") ?? "");

  return forwardedFor || headers.get("cf-connecting-ip") || headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const existingBucket = buckets.get(key);

  if (!existingBucket || existingBucket.resetAt <= now) {
    const resetAt = now + config.windowMs;
    buckets.set(key, {
      count: 1,
      resetAt
    });

    return {
      allowed: true,
      limit: config.limit,
      remaining: Math.max(0, config.limit - 1),
      resetAt,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000)
    };
  }

  if (existingBucket.count >= config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt: existingBucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000))
    };
  }

  existingBucket.count += 1;

  return {
    allowed: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - existingBucket.count),
    resetAt: existingBucket.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000))
  };
}

export function buildRateLimitHeaders(result: RateLimitResult) {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000))
  };

  if (!result.allowed) {
    headers["Retry-After"] = String(result.retryAfterSeconds);
  }

  return headers;
}
