// src/pages/EventDisplay.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import RotatingQR from "../components/RotatingQR";

export default function EventDisplay() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("events")
          .select("id, name, starts_at, ends_at, image_url")
          .eq("id", eventId)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Event not found");

        setEvent(data);
      } catch (e) {
        setError(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) loadEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-violet-400 animate-spin mx-auto mb-4" />
          <div className="text-zinc-400 text-base">Loading event...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4">
        <div className="card p-6 max-w-md w-full text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">Error</div>
          <div className="text-zinc-400">{error || "Event not found"}</div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const starts = new Date(event.starts_at);
  const ends = new Date(event.ends_at);
  const isActive = now >= starts && now <= ends;
  const isPast = now > ends;
  const isFuture = now < starts;

  const fmt = (d) => d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/50 backdrop-blur">
        <div className="container-px mx-auto py-4 sm:py-6">
          <div className="flex items-center gap-3">
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.name}
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl object-cover border-2 border-zinc-700 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-white truncate">{event.name}</h1>
              <div className="mt-0.5 text-sm text-zinc-400">
                {fmt(starts)} – {fmt(ends)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-px mx-auto py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Status Banner */}
          <div className="mb-6">
            {isActive && (
              <div className="card p-4 bg-green-900/20 border-green-700/50">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  <div className="text-green-400 font-semibold text-base">Event is LIVE — scan to claim your POAP!</div>
                </div>
              </div>
            )}
            {isFuture && (
              <div className="card p-4 bg-blue-900/20 border-blue-700/50">
                <div className="text-blue-400 font-semibold text-base">
                  Starts {fmt(starts)}
                </div>
              </div>
            )}
            {isPast && (
              <div className="card p-4 bg-zinc-900/50 border-zinc-700">
                <div className="text-zinc-400 text-base">
                  This event has ended. POAPs are no longer available.
                </div>
              </div>
            )}
          </div>

          {/* QR Code Display */}
          {isActive ? (
            <div className="card p-5 sm:p-8">
              <div className="text-center mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Scan to Claim Your POAP</h2>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Open the POAP app on your phone, go to Scan, and point your camera here.
                </p>
              </div>

              <div className="flex justify-center">
                <RotatingQR eventId={eventId} intervalMs={10000} />
              </div>

              <ol className="mt-6 space-y-2">
                {[
                  'Open the POAP app and go to the Scan page',
                  'Point your camera at the QR code above',
                  'Your POAP will be minted automatically',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="text-zinc-600 font-mono flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="card p-8 sm:p-12">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl mb-4">🎟️</div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {isFuture ? "Coming Soon" : "Event Ended"}
                </h2>
                <p className="text-zinc-400 text-base">
                  {isFuture
                    ? "Check back when the event starts to claim your POAP"
                    : "Thanks for participating! Check your wallet for your POAP."}
                </p>
              </div>
            </div>
          )}

          {/* Event Info */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="text-sm text-zinc-500 mb-1">Starts</div>
              <div className="text-white font-semibold text-sm sm:text-base">{fmt(starts)}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-zinc-500 mb-1">Ends</div>
              <div className="text-white font-semibold text-sm sm:text-base">{fmt(ends)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 bg-black/50 backdrop-blur mt-8">
        <div className="container-px mx-auto py-5 text-center text-sm text-zinc-600">
          Powered by POAP · Proof of Attendance Protocol
        </div>
      </div>
    </div>
  );
}
