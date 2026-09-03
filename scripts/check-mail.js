/**
 * Sending check for lead notifications.
 *
 * Takes Vercel out of the picture: reads the key from .env.local, calls Resend
 * directly, and prints the provider's own response. That separates "the key or
 * domain is wrong" from "the key never reached the deployed build", which the
 * provider dashboard cannot tell you — when no key is present the app returns
 * before making any network call, so the dashboard looks identical to never
 * having tried.
 *
 *   node scripts/check-mail.js you@example.com
 *
 * The key is never printed. Only its prefix and length are shown.
 */

const fs = require("node:fs");
const path = require("node:path");

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

async function main() {
  loadEnvLocal();

  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.LEAD_FROM_EMAIL ||
    "Good Looking Digital <hello@goodlookingdigital.com>";
  const to = process.argv[2] || process.env.LEAD_NOTIFICATION_EMAIL;

  console.log("key present ", Boolean(key));
  if (key) {
    console.log("key shape   ", `${key.slice(0, 3)}… length ${key.length}`);
    if (!key.startsWith("re_")) {
      console.log("            WARNING: Resend keys normally start with re_");
    }
    if (key !== key.trim()) {
      console.log("            WARNING: value has surrounding whitespace");
    }
  }
  console.log("from        ", from);
  console.log("to          ", to || "(not set — pass one as an argument)");
  console.log("");

  if (!key) {
    console.error("RESEND_API_KEY is not set in .env.local. Nothing to test.");
    process.exit(1);
  }
  if (!to) {
    console.error(
      "No recipient. Pass one: node scripts/check-mail.js you@example.com",
    );
    process.exit(1);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Good Looking Digital — sending check",
      text: "If this arrived, the API key and the sending domain are both working. Sent by scripts/check-mail.js.",
    }),
  });

  const body = await res.text();
  console.log("HTTP        ", res.status, res.statusText);
  console.log("response    ", body);
  console.log("");

  if (res.ok) {
    console.log("Sent. Check the inbox, and check spam — a new sending domain");
    console.log("often lands there for its first few messages.");
    console.log("");
    console.log(
      "This key works. If the deployed site still does not send, the",
    );
    console.log(
      "problem is the value stored in Vercel, not the key or domain.",
    );
  } else {
    console.log("Resend refused it. What the status means:");
    console.log("  401  the key is wrong, revoked, or truncated");
    console.log("  403  the sending domain is not verified for this account");
    console.log(
      "  422  the from address is malformed or not on a verified domain",
    );
    console.log("  429  rate limited — wait and retry");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exitCode = 1;
});
