/**
 * Connection check for the lead database.
 *
 * Run before wiring anything into Vercel: it answers "can this connection
 * string actually reach the cluster, authenticate, write, and read back" in
 * about two seconds, which is a much shorter feedback loop than deploying and
 * submitting the form.
 *
 *   node scripts/check-db.js          reads MONGODB_URI from .env.local
 *
 * The URI is never printed. Only the host is shown, with credentials stripped,
 * so the output is safe to paste into a chat or an issue.
 */

const fs = require("node:fs");
const path = require("node:path");
const { MongoClient } = require("mongodb");

/** Minimal .env.local reader. Next loads this file; a plain node script does not. */
function loadEnvLocal() {
  const file = path.join(__dirname, "..", ".env.local");
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

/** Host only. Whatever happens, the password does not reach stdout. */
function safeHost(uri) {
  try {
    const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    const afterCreds = withoutScheme.includes("@")
      ? withoutScheme.slice(withoutScheme.indexOf("@") + 1)
      : withoutScheme;
    return afterCreds.split("/")[0].split("?")[0];
  } catch {
    return "unparseable";
  }
}

async function main() {
  loadEnvLocal();

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "good_looking_digital";

  if (!uri) {
    console.error("MONGODB_URI is not set.");
    console.error("Add it to .env.local — that file is gitignored.");
    process.exit(1);
  }

  console.log("host    ", safeHost(uri));
  console.log("database", dbName);
  console.log(
    "scheme  ",
    uri.startsWith("mongodb+srv://") ? "SRV (Atlas)" : "standard",
  );
  console.log("");

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    await client.connect();
    const db = client.db(dbName);

    await db.command({ ping: 1 });
    console.log("connect   ok");

    // The app calls createIndex on every request; it is idempotent. Doing it
    // here proves the user has write permission, not just read.
    await db.collection("leads").createIndex({ receivedAt: -1 });
    await db
      .collection("rate_limits")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log("indexes   ok (write permission confirmed)");

    const leads = await db.collection("leads").countDocuments();
    const limits = await db.collection("rate_limits").countDocuments();
    console.log(`leads     ${leads}`);
    console.log(`rate_limits ${limits}`);

    const newest = await db
      .collection("leads")
      .find({}, { projection: { name: 1, path: 1, receivedAt: 1 } })
      .sort({ receivedAt: -1 })
      .limit(3)
      .toArray();

    if (newest.length) {
      console.log("\nmost recent:");
      for (const lead of newest) {
        console.log(
          `  ${lead.receivedAt?.toISOString()}  ${lead.path}  ${lead.name}`,
        );
      }
    }

    console.log("\nReady. Use this same string as MONGODB_URI in Vercel.");
  } catch (error) {
    console.error("\nFAILED:", error.message);
    console.error("\nCommon causes:");
    console.error(
      "  auth failed        wrong password, or the user lacks access to this database",
    );
    console.error(
      "  timed out          Network Access does not allow the connecting IP",
    );
    console.error(
      "  ENOTFOUND          hostname typo, or the cluster is paused",
    );
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
