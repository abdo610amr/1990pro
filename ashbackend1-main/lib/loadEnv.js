// Zero-dependency .env loader (no `dotenv` package required).
// Imported for its side effect at the very top of server.js so that
// process.env is populated BEFORE any other module reads it.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env");

export function loadEnv() {
  let raw;
  try {
    raw = fs.readFileSync(ENV_PATH, "utf-8");
  } catch {
    // No .env file present — rely on the real process environment.
    return;
  }

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // Strip surrounding quotes if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Don't override variables already set in the real environment.
    if (!(key in process.env)) process.env[key] = value;
  }
}

// Run on import so a single `import "./lib/loadEnv.js"` is enough.
loadEnv();
