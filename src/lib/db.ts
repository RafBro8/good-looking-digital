import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection for a serverless runtime.
 *
 * Each invocation may reuse a warm container, so the client is cached on
 * globalThis rather than module scope — module scope is re-evaluated on every
 * cold start and in development on every hot reload, which would otherwise
 * open a new connection pool each time and exhaust the Atlas connection limit.
 */

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "good_looking_digital";

declare global {
  var _gldMongoClient: Promise<MongoClient> | undefined;
}

/** True when the database is configured. Lets callers degrade rather than throw. */
export function isDatabaseConfigured(): boolean {
  return typeof uri === "string" && uri.length > 0;
}

function client(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it as an environment variable — never commit it.",
    );
  }

  if (!globalThis._gldMongoClient) {
    globalThis._gldMongoClient = new MongoClient(uri, {
      // Fail fast rather than leaving a visitor watching a spinner.
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
    }).connect();
  }

  return globalThis._gldMongoClient;
}

export async function getDb(): Promise<Db> {
  return (await client()).db(dbName);
}

/**
 * Indexes this app relies on. Safe to call repeatedly — createIndex is
 * idempotent. Called from the lead route rather than at import time so a
 * build never needs a live database.
 */
let indexesEnsured = false;

export async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return;

  const db = await getDb();

  await db.collection("leads").createIndex({ receivedAt: -1 });

  // Rate-limit records expire on their own, so nothing has to sweep them.
  await db
    .collection("rate_limits")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  indexesEnsured = true;
}
