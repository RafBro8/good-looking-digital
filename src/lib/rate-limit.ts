import { getDb } from "@/lib/db";

/**
 * Submission rate limiting, shared by every form route.
 *
 * Counted in Mongo rather than in memory: serverless invocations do not share
 * memory, so an in-process counter resets constantly and enforces nothing.
 * Records carry a TTL, so nothing has to clean up after them.
 *
 * Scoped per route. The lead form and the text alert opt-in are different
 * actions with different shapes of abuse, and sharing one budget meant a
 * client turning alerts on could spend part of the allowance that exists to
 * keep a stranger from flooding the enquiry form.
 */

const DEFAULTS = { max: 5, windowMs: 60 * 60 * 1000 };

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || request.headers.get("x-real-ip") || "unknown";
}

export async function overRateLimit(
  request: Request,
  scope: string,
  limit: { max?: number; windowMs?: number } = {},
): Promise<boolean> {
  const ip = clientKey(request);
  if (ip === "unknown") return false;

  const max = limit.max ?? DEFAULTS.max;
  const windowMs = limit.windowMs ?? DEFAULTS.windowMs;
  const key = `${scope}:${ip}`;

  try {
    const db = await getDb();
    const now = new Date();
    const since = new Date(now.getTime() - windowMs);

    const recent = await db
      .collection("rate_limits")
      .countDocuments({ key, at: { $gte: since } });

    if (recent >= max) return true;

    await db.collection("rate_limits").insertOne({
      key,
      at: now,
      expiresAt: new Date(now.getTime() + windowMs),
    });

    return false;
  } catch (error) {
    // A limiter that is down must not become a closed door.
    console.error("[rate-limit] check failed, allowing through", scope, error);
    return false;
  }
}
