/**
 * migrate-images-to-cloudinary.mjs
 *
 * One-shot script: reads all photo URLs from Supabase, uploads each image
 * to Cloudinary, then updates the row with the new Cloudinary URL.
 *
 * Supports:
 *   - Raw base64 strings           (no prefix — what is currently stored)
 *   - Base64 data URIs             (data:image/…;base64,…)
 *   - External HTTP(S) URLs
 *   - Already-migrated Cloudinary URLs (skipped automatically)
 *
 * Usage:
 *   node scripts/migrate-images-to-cloudinary.mjs
 *
 * Required env vars (loaded from .env.local automatically):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY          ← needs UPDATE permission on these tables
 *   VITE_CLOUDINARY_CLOUD_NAME
 *   VITE_CLOUDINARY_UPLOAD_PRESET
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
// FormData and Blob are globals in Node 20 — no import needed

// ── Load .env.local ──────────────────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;
const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!SUPABASE_URL || !SUPABASE_KEY || !CLOUD_NAME || !UPLOAD_PRESET) {
  console.error("Missing required env vars in .env.local");
  process.exit(1);
}

// ── Supabase REST helpers ────────────────────────────────────────────────────

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function supabaseSelectPage(table, columns, offset, limit) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&limit=${limit}&offset=${offset}`,
    { headers },
  );
  if (!res.ok) throw new Error(`GET ${table} failed: ${await res.text()}`);
  return res.json();
}

async function supabasePatch(table, id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(patch),
  });
  if (!res.ok)
    throw new Error(`PATCH ${table} id=${id} failed: ${await res.text()}`);
}

// ── Cloudinary upload ────────────────────────────────────────────────────────

async function uploadToCloudinary(buf) {
  const fd = new FormData();
  fd.append("upload_preset", UPLOAD_PRESET);
  // Send raw binary — Cloudinary auto-detects JPEG/PNG/WebP from magic bytes
  const blob = new Blob([buf]);
  fd.append("file", blob, "image");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Cloudinary upload failed (${res.status})`,
    );
  }
  const data = await res.json();
  return data.secure_url;
}

// ── Value classifiers & decoders ─────────────────────────────────────────────

function isCloudinaryUrl(value) {
  return typeof value === "string" && value.includes("res.cloudinary.com");
}

function isEmpty(value) {
  return !value || value.trim() === "";
}

/** True when the string is a raw base64 payload (no data: prefix, no http). */
function isRawBase64(value) {
  if (value.startsWith("http") || value.startsWith("data:")) return false;
  // base64 alphabet + padding only
  return /^[A-Za-z0-9+/]+=*$/.test(value.trim());
}

/** Decode whatever format the stored value is in to a Buffer. */
async function toBuffer(value) {
  if (value.startsWith("data:")) {
    // data:image/jpeg;base64,<payload>
    const payload = value.slice(value.indexOf(",") + 1);
    return Buffer.from(payload, "base64");
  }
  if (isRawBase64(value)) {
    return Buffer.from(value.trim(), "base64");
  }
  // Remote URL — download it
  const res = await fetch(value);
  if (!res.ok)
    throw new Error(`Failed to fetch image (${res.status}): ${value}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Column map: { table, idColumn, photoColumns[] } ─────────────────────────

const TABLES = [
  {
    table: "players",
    idCol: "id",
    photoCols: ["photo_url"],
  },
  {
    table: "clubs",
    idCol: "id",
    photoCols: ["logo_url", "coach_photo_url", "assistant_coach_photo_url"],
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

let migrated = 0;
let skipped = 0;
let failed = 0;

const PAGE_SIZE = 10;

for (const { table, idCol, photoCols } of TABLES) {
  const selectCols = [idCol, ...photoCols].join(",");
  console.log(`\n── ${table} ──────────────────────────────────────`);

  let offset = 0;
  let pageRows;

  do {
    try {
      pageRows = await supabaseSelectPage(table, selectCols, offset, PAGE_SIZE);
    } catch (e) {
      console.error(
        `  Could not fetch ${table} (offset ${offset}): ${e.message}`,
      );
      break;
    }

    for (const row of pageRows) {
      const id = row[idCol];

      for (const col of photoCols) {
        const url = row[col];

        if (isEmpty(url)) {
          continue; // no image stored
        }
        if (isCloudinaryUrl(url)) {
          console.log(`  [SKIP] ${table}/${id} ${col} — already on Cloudinary`);
          skipped++;
          continue;
        }

        process.stdout.write(`  [MIGRATE] ${table}/${id} ${col} … `);

        try {
          const buf = await toBuffer(url);
          const cloudinaryUrl = await uploadToCloudinary(buf);
          await supabasePatch(table, id, { [col]: cloudinaryUrl });
          console.log(`OK → ${cloudinaryUrl}`);
          migrated++;
        } catch (e) {
          console.log(`FAILED — ${e.message}`);
          failed++;
        }
      }
    }

    offset += PAGE_SIZE;
  } while (pageRows.length === PAGE_SIZE);
}

console.log(`
────────────────────────────────────────
Migration complete.
  Migrated : ${migrated}
  Skipped  : ${skipped} (already on Cloudinary)
  Failed   : ${failed}
────────────────────────────────────────
`);
if (failed > 0) process.exit(1);
