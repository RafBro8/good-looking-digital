import { MongoClient } from "mongodb";

import { TEST_DB } from "./db";

/**
 * Clears the test database before every run.
 *
 * Not housekeeping — correctness. The lead route rate-limits to five
 * submissions an hour per IP, and every spec arrives from 127.0.0.1, so a
 * second run inside the same hour would start part-way through that budget and
 * fail on a 429 that has nothing to do with the code under test. The rate
 * limiter is right; the tests just have to stop looking like one determined
 * visitor.
 *
 * It also means assertions run against a known-empty collection rather than
 * whatever the last run left behind.
 */
export default async function globalSetup(): Promise<void> {
  const uri = process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27019";
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20_000 });

  try {
    await client.connect();
    const db = client.db(TEST_DB);
    const leads = await db.collection("leads").deleteMany({});
    const limits = await db.collection("rate_limits").deleteMany({});
    console.log(
      `[e2e] cleared ${TEST_DB}: ${leads.deletedCount} leads, ${limits.deletedCount} rate-limit records`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[e2e] could not reach the test database at ${uri}.\n` +
        `Start it with: docker start gld-mongo-test\n` +
        `Cause: ${message}`,
    );
  } finally {
    await client.close();
  }
}
