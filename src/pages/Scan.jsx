import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";
import { Scanner } from "@yudiel/react-qr-scanner";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Scan() {
  const { wallet } = useAppStore();
  const [mintResult, setMintResult] = useState(null); // { asset, reused }
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  // Once a mint succeeds (new or reused), lock the scanner shut
  const doneRef = useRef(false);

  const handleScan = async (text) => {
    if (busyRef.current || doneRef.current) return;
    busyRef.current = true;

    try {
      setBusy(true);
      setError("");

      if (!text) { setError("Empty QR code"); return; }

      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        setError("Invalid QR format");
        return;
      }

      const { token, sig, signer } = payload || {};
      if (!token?.event || !sig || !signer) {
        setError("Invalid QR payload — missing fields");
        return;
      }

      if (!wallet?.address) {
        setError("No wallet found. Go to Dashboard and create one first.");
        return;
      }

      // Pre-validate event timing client-side for a friendly error message
      const { data: ev } = await supabase
        .from("events")
        .select("name, starts_at, ends_at")
        .eq("id", token.event)
        .maybeSingle();

      if (ev) {
        const now = Date.now();
        const start = new Date(ev.starts_at).getTime();
        const end = new Date(ev.ends_at).getTime();
        const fmt = (d) => new Date(d).toLocaleString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        if (now < start) {
          setError(`"${ev.name}" hasn't started yet — it begins on ${fmt(ev.starts_at)}.`);
          return;
        }
        if (now > end) {
          setError(`"${ev.name}" ended on ${fmt(ev.ends_at)}. Minting is no longer available.`);
          return;
        }
      }

      const { data, error: mintError } = await supabase.functions.invoke("mint", {
        body: { event_id: token.event, token, sig, signer, wallet_pubkey: wallet.address },
      });

      if (mintError) {
        let msg = mintError.message;
        try {
          const resp = mintError.context;
          if (resp && typeof resp.text === "function") {
            const ct = resp.headers?.get("content-type") || "";
            const body = ct.includes("application/json") ? await resp.json() : await resp.text();
            msg = body?.error || body?.detail || body || msg;
          }
        } catch {}
        setError(msg);
        return;
      }

      // Lock scanner — we're done whether new or reused
      doneRef.current = true;
      setMintResult({ asset: data?.minted_asset, reused: data?.reused ?? false });
    } catch (e) {
      setError(e?.message || "Mint failed");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const onScanSuccess = (result) => {
    if (result?.length > 0) {
      handleScan(result[0]?.rawValue || result);
    }
  };

  const reset = () => {
    doneRef.current = false;
    busyRef.current = false;
    setMintResult(null);
    setError("");
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="container-px mx-auto max-w-screen-xl pt-10 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white">Scan POAP</h1>
          <p className="mt-2 text-base text-zinc-500">
            Point your camera at the rotating QR code at the event to mint your badge.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Scanner card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/40 via-cyan-500/40 to-transparent z-10" />

            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-white">Camera</div>
                <div className="text-sm text-zinc-500 mt-0.5">
                  {doneRef.current ? "Scan complete" : busy ? "Processing..." : "Scanning..."}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {busy ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                ) : doneRef.current ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
                )}
                <span className="text-sm text-zinc-400">
                  {busy ? "Minting" : doneRef.current ? "Done" : "Live"}
                </span>
              </div>
            </div>

            <div className="relative">
              {doneRef.current ? (
                <div className="aspect-square flex items-center justify-center bg-zinc-900">
                  <div className="text-center text-zinc-600">
                    <svg className="w-16 h-16 mx-auto mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base">Scanner stopped</p>
                  </div>
                </div>
              ) : (
                <Scanner
                  constraints={{ facingMode: "environment" }}
                  onScan={onScanSuccess}
                  onError={(err) => setError(err?.message || "Camera error")}
                  components={{ audio: false, finder: true }}
                />
              )}
            </div>
          </motion.div>

          {/* Status card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Wallet status */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/40 via-cyan-500/40 to-transparent" />
              <div className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Wallet</div>
              {wallet?.address ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  <span className="font-mono text-base text-zinc-300 truncate">
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-base text-zinc-400">No wallet —</span>
                  <Link to="/app" className="text-base text-violet-400 hover:text-violet-300 transition-colors">
                    create one first →
                  </Link>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="text-sm text-zinc-500 uppercase tracking-wider mb-4">How to scan</div>
              <ol className="space-y-3">
                {[
                  "Point your camera at the QR code displayed at the event",
                  "Hold steady — the code is detected automatically",
                  "Your POAP badge will be minted on Solana instantly",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center text-xs text-violet-300 font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-base text-zinc-400 leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Result / Error */}
            <AnimatePresence mode="wait">
              {mintResult && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-2xl overflow-hidden border border-green-700/50 bg-green-900/20 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-green-400">
                        {mintResult.reused ? "Already collected!" : "Badge minted!"}
                      </div>
                      <div className="text-sm text-zinc-400 mt-1">
                        {mintResult.reused
                          ? "You already have this POAP in your collection."
                          : "Your POAP badge is now on-chain on Solana."}
                      </div>
                      {mintResult.asset && (
                        <a
                          href={`https://solscan.io/address/${mintResult.asset}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          View on Solscan
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      to="/app"
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all"
                    >
                      View collection →
                    </Link>
                    {!mintResult.reused && (
                      <button
                        onClick={reset}
                        className="py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
                      >
                        Scan another
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-red-700/50 bg-red-900/20 p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-red-400">Mint failed</div>
                      <div className="text-sm text-red-300/80 mt-1">{error}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
                  >
                    Try again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {busy && !mintResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-violet-700/30 bg-violet-900/10 p-5 flex items-center gap-4"
              >
                <div className="w-6 h-6 rounded-full border-2 border-violet-700 border-t-violet-300 animate-spin flex-shrink-0" />
                <div>
                  <div className="text-base font-medium text-violet-300">Minting on Solana...</div>
                  <div className="text-sm text-zinc-500 mt-0.5">This usually takes a few seconds</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
