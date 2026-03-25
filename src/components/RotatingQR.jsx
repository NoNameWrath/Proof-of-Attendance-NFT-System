// src/components/RotatingQR.jsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { QRCodeCanvas } from "qrcode.react";

const FUNCTIONS_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1`;

export default function RotatingQR({ eventId, intervalMs = 10000 }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [ttl, setTtl] = useState(0);
  const [qrSize, setQrSize] = useState(() => Math.min(window.innerWidth - 48, 320));
  const timerRef = useRef(null);
  const tickRef = useRef(null);
  const fetchingRef = useRef(false);

  // Responsive QR size
  useEffect(() => {
    const update = () => setQrSize(Math.min(window.innerWidth - 48, 320));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  async function fetchToken() {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FUNCTIONS_URL}/qr-issue?event_id=${eventId}`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` }
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "qr-issue failed");
      }

      setPayload(json);

      const now = Math.floor(Date.now() / 1000);
      setTtl(Math.max(0, (json?.token?.exp ?? now) - now));
    } catch (e) {
      setError(e.message || "Failed to fetch QR token");
    } finally {
      fetchingRef.current = false;
    }
  }

  useEffect(() => {
    fetchToken();
    timerRef.current = setInterval(fetchToken, intervalMs);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, intervalMs]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (payload?.token?.exp) {
      tickRef.current = setInterval(() => setTtl(t => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [payload?.token?.exp]);

  const qrValue = payload ? JSON.stringify(payload) : "";

  return (
    <div className="flex flex-col items-center w-full">
      {payload && qrValue ? (
        <>
          <QRCodeCanvas
            value={qrValue}
            size={qrSize}
            level="H"
            includeMargin={true}
            bgColor="#000000"
            fgColor="#ffffff"
          />
          <div className="mt-3 text-sm text-zinc-400">
            Expires in <span className="font-mono text-white">{ttl}s</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 max-w-xs break-all text-center">
            Event: {payload.token?.event?.slice(0, 8)}...
          </div>
        </>
      ) : (
        <div
          className="flex flex-col items-center justify-center bg-zinc-900 rounded border border-zinc-700"
          style={{ width: qrSize, height: qrSize }}
        >
          <div className="text-sm text-zinc-500">Loading QR code...</div>
        </div>
      )}
      {error && (
        <div className="mt-3 text-xs text-red-400 bg-red-900/30 border border-red-700 p-2 rounded max-w-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}
