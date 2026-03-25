import { supabase } from "../lib/supabase";

/**
 * Fetch the current user's wallet (or null if none exists)
 */
export async function getUserWallet() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("wallets")
    .select("public_key")
    .eq("user_email", user.email)
    .maybeSingle();

  if (error) {
    console.error("fetch wallet error:", error);
    return null;
  }

  return data?.public_key ?? null;
}

/**
 * Calls the wallet edge function to create the wallet.
 * The function already handles duplicates. If wallet already exists,
 * it returns { alreadyExists: true, public_key: "..." }
 */
export async function createWallet() {
  // must be logged in (edge fn has verify_jwt = true)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not logged in");

  // generate keypair client-side
  const { Keypair } = await import("@solana/web3.js");
  const kp = Keypair.generate();
  const address = kp.publicKey.toBase58();
  const secretKeyB64 = btoa(String.fromCharCode(...kp.secretKey)); // 64 bytes → b64
  // persist via edge function (idempotent)
  const { data, error } = await supabase.functions.invoke("wallet", {
    body: { address, secretKey: secretKeyB64 },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) throw error;
  return { ...data, address, secretKey: secretKeyB64 };
}
export async function getUserSecretKey() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not logged in");

  // Call the edge function GET endpoint which decrypts the key server-side.
  // Never read secret_key directly from the DB on the client.
  const { data, error } = await supabase.functions.invoke("wallet", {
    method: "GET",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) throw error;
  if (!data?.secret_key) throw new Error("No secret key found");

  return data.secret_key;
}