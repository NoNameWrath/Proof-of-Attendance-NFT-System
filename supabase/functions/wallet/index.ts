import { createClient } from "npm:@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("project_url")!;
const ANON_KEY    = Deno.env.get("product_anon_key")!;
// 64-char hex string = 32 bytes = AES-256 key.
// Set via: supabase secrets set WALLET_ENCRYPTION_KEY=<hex>
const ENC_KEY_HEX = Deno.env.get("WALLET_ENCRYPTION_KEY") ?? "";

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
} as const);

// ── Encryption helpers ────────────────────────────────────────────────────────

function hexToU8(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function importKey(hex: string) {
  return crypto.subtle.importKey("raw", hexToU8(hex), "AES-GCM", false, ["encrypt", "decrypt"]);
}

// Encrypted format: "<iv_b64>.<ciphertext_b64>"
async function encrypt(plaintext: string): Promise<string> {
  if (!ENC_KEY_HEX) return plaintext; // no key configured — store as-is (dev fallback)
  const key = await importKey(ENC_KEY_HEX);
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const ct  = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
  return btoa(String.fromCharCode(...iv)) + "." + btoa(String.fromCharCode(...new Uint8Array(ct)));
}

async function decrypt(stored: string): Promise<string> {
  // Legacy: no dot separator means plaintext (stored before encryption was added)
  if (!ENC_KEY_HEX || !stored.includes(".")) return stored;
  const [ivB64, ctB64] = stored.split(".");
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
  const key = await importKey(ENC_KEY_HEX);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plain);
}

// ── Body parser ───────────────────────────────────────────────────────────────

async function parseBody(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;
  const ct = req.headers.get("content-type") || "";
  let address: string | null = null;
  let secretKey: string | null = null;

  try {
    if (ct.includes("application/json")) {
      const j = await req.json();
      address   = (j?.address ?? j?.public_key ?? j?.publicKey ?? null)?.toString() ?? null;
      secretKey = (j?.secretKey ?? j?.secret_key ?? null)?.toString() ?? null;
    } else if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      const f = await req.formData();
      address   = (f.get("address") ?? f.get("public_key") ?? f.get("publicKey"))?.toString() ?? null;
      secretKey = (f.get("secretKey") ?? f.get("secret_key"))?.toString() ?? null;
    }
  } catch { /* ignore */ }

  address   ||= params.get("address")   ?? params.get("public_key") ?? params.get("publicKey");
  secretKey ||= params.get("secretKey") ?? params.get("secret_key");
  return { address: address?.trim() || null, secretKey: secretKey?.trim() || null };
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: cors(origin) });

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(PROJECT_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors(origin) });

  try {
    // ── GET: return decrypted secret key for the authenticated user ────────────
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("wallets")
        .select("secret_key")
        .eq("user_email", user.email)
        .maybeSingle();

      if (error) return new Response(JSON.stringify({ error: "Lookup failed", detail: error.message }), { status: 500, headers: cors(origin) });
      if (!data?.secret_key) return new Response(JSON.stringify({ error: "No wallet found" }), { status: 404, headers: cors(origin) });

      const decrypted = await decrypt(data.secret_key);
      return new Response(JSON.stringify({ secret_key: decrypted }), { status: 200, headers: cors(origin) });
    }

    // ── POST: create wallet, encrypting secret key before storage ──────────────
    if (req.method === "POST") {
      const { address, secretKey } = await parseBody(req);
      if (!address) {
        return new Response(JSON.stringify({
          error: "Missing address",
          hint: "Send { address, secretKey } as JSON",
        }), { status: 400, headers: cors(origin) });
      }

      // Idempotent read — if wallet already exists, return it without overwriting
      const existing = await supabase
        .from("wallets")
        .select("public_key")
        .eq("user_email", user.email)
        .maybeSingle();

      if (existing.error) return new Response(JSON.stringify({ error: "Lookup failed", detail: existing.error.message }), { status: 500, headers: cors(origin) });
      if (existing.data) {
        return new Response(JSON.stringify({ ok: true, alreadyExists: true, public_key: existing.data.public_key }), { status: 200, headers: cors(origin) });
      }

      // Encrypt secret before storing
      const encryptedSecret = secretKey ? await encrypt(secretKey) : null;

      const inserted = await supabase
        .from("wallets")
        .upsert([{ user_email: user.email, public_key: address, secret_key: encryptedSecret }], { onConflict: "user_email" })
        .select("public_key")
        .single();

      if (inserted.error) return new Response(JSON.stringify({ error: "Insert failed", detail: inserted.error.message }), { status: 500, headers: cors(origin) });

      return new Response(JSON.stringify({ ok: true, public_key: inserted.data.public_key }), { status: 200, headers: cors(origin) });
    }

    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: cors(origin) });

  } catch (e) {
    const msg = (e as Error)?.message ?? String(e);
    return new Response(JSON.stringify({ error: "Unhandled", detail: msg }), { status: 500, headers: cors(origin) });
  }
});
