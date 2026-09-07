import fs from "node:fs";
import path from "node:path";
import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

/**
 * Database access for the end-to-end tests.
 *
 * Two specs assert on what was actually written rather than trusting the API
 * response, because "the route returned ok" and "the lead survived" are not the
 * same claim, and the second is the one a visitor cares about.
 */

/** Playwright does not read .env.local. Locally this is where the URI lives. */
export function loadEnvLocal(): void {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;

  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

/** Always the test database. Never the collection holding real enquiries. */
export const TEST_DB = "good_looking_digital_test";

export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  loadEnvLocal();

  // Same throwaway instance the app under test is pointed at, never Atlas.
  const uri = process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27019";

  const options = { serverSelectionTimeoutMS: 20_000 };
  let client = new MongoClient(uri, options);

  try {
    await client.connect();
  } catch (error) {
    // Some machines hand Node a resolver that refuses SRV lookups, which is
    // what a mongodb+srv:// URI needs. Documented in scripts/check-db.js.
    const message = error instanceof Error ? error.message : String(error);
    if (!/querySrv|EREFUSED|ECONNREFUSED|ENOTFOUND/.test(message)) throw error;
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await client.close().catch(() => {});
    client = new MongoClient(uri, options);
    await client.connect();
  }

  try {
    return await fn(client.db(TEST_DB));
  } finally {
    await client.close();
  }
}

/** Unique per test so parallel runs across three engines cannot collide. */
export function uniqueEmail(label: string): string {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return `e2e-${label}-${stamp}@example.com`;
}
