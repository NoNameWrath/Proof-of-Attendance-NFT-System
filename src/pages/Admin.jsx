// src/pages/Admin.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";
import Navbar from "../components/Navbar";
import CreateEventForm from "../components/CreateEventForm";
import RotatingQR from "../components/RotatingQR";

// ── Attendance panel ──────────────────────────────────────────────────────────
function AttendancePanel({ eventId }) {
  const [passes, setPasses] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setPasses(null);
    supabase
      .from("passes")
      .select("user_email, wallet_pubkey, minted_asset, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPasses(data ?? []));
  }, [eventId]);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xl font-semibold text-white">Attendance</div>
          <div className="text-sm text-zinc-500 mt-1">
            {passes === null ? "Loading..." : `${passes.length} badge${passes.length !== 1 ? "s" : ""} minted`}
          </div>
        </div>
        {passes?.length > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {passes.length} attended
          </span>
        )}
      </div>

      {passes === null && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 py-4">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-violet-400 animate-spin" />
          Loading attendance...
        </div>
      )}

      {passes?.length === 0 && (
        <div className="py-8 text-center rounded-xl border border-dashed border-zinc-800">
          <div className="text-zinc-500 text-base">No attendees yet</div>
          <div className="text-zinc-600 text-sm mt-1">Badges will appear here as people scan</div>
        </div>
      )}

      {passes?.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-auto">
          {passes.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center text-xs text-violet-300 font-bold flex-shrink-0">
                {(p.user_email?.[0] ?? "?").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{p.user_email}</div>
                <div className="text-xs text-zinc-500 font-mono truncate">
                  {p.wallet_pubkey?.slice(0, 8)}...{p.wallet_pubkey?.slice(-6)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.minted_asset ? (
                  <a
                    href={`https://solscan.io/address/${p.minted_asset}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Solscan ↗
                  </a>
                ) : (
                  <span className="text-xs text-yellow-500">Pending</span>
                )}
                <span className="text-xs text-zinc-600">
                  {new Date(p.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Request form for non-admins ──────────────────────────────────────────────
function AdminRequestPanel() {
  const [message, setMessage] = useState("");
  const [existing, setExisting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.functions.invoke("admin-request", { method: "GET" });
      if (!error) setExisting(data?.request ?? false);
    })();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("admin-request", {
        method: "POST",
        body: { message },
      });
      if (error) throw error;
      setExisting({ status: "pending", message });
    } catch (e) {
      setErr(e?.message || "Failed to submit request");
    } finally {
      setBusy(false);
    }
  }

  const statusColor = {
    pending: "text-yellow-400",
    approved: "text-green-400",
    denied: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="container-px mx-auto max-w-2xl pt-12 pb-20">
        <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
        <p className="text-zinc-400 mb-8 text-base">
          Admin access lets you create and manage POAP events, generate QR codes, and review attendance.
        </p>

        {existing === null && (
          <div className="text-zinc-500 text-base">Checking status...</div>
        )}

        {existing && (
          <div className="card p-6 mb-6">
            <div className="text-sm text-zinc-400 mb-2">Your request status</div>
            <div className={`text-2xl font-semibold capitalize ${statusColor[existing.status] ?? "text-white"}`}>
              {existing.status}
            </div>
            {existing.message && (
              <p className="mt-3 text-base text-zinc-400">"{existing.message}"</p>
            )}
            {existing.status === "pending" && (
              <p className="mt-3 text-base text-zinc-500">
                An admin will review your request. You'll have access after approval.
              </p>
            )}
            {existing.status === "denied" && (
              <div className="mt-5">
                <p className="text-base text-zinc-400 mb-4">You can re-submit a new request below.</p>
                <form onSubmit={submit} className="space-y-4">
                  <textarea
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base resize-none focus:outline-none focus:border-violet-500"
                    rows={3}
                    placeholder="Why do you need admin access? (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="btn btn-primary w-full py-3 text-base" disabled={busy}>
                    {busy ? "Submitting..." : "Re-submit Request"}
                  </button>
                  {err && <div className="text-sm text-red-500">{err}</div>}
                </form>
              </div>
            )}
          </div>
        )}

        {existing === false && (
          <div className="card p-6">
            <div className="text-base text-zinc-400 mb-4">Request Access</div>
            <form onSubmit={submit} className="space-y-4">
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base resize-none focus:outline-none focus:border-violet-500"
                rows={3}
                placeholder="Why do you need admin access? (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="btn btn-primary w-full py-3 text-base" disabled={busy}>
                {busy ? "Submitting..." : "Request Admin Access"}
              </button>
              {err && <div className="text-sm text-red-500">{err}</div>}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Pending requests queue for admins ────────────────────────────────────────
function PendingRequestsPanel({ onUpdate }) {
  const [requests, setRequests] = useState(null);
  const [busy, setBusy] = useState({});

  async function load() {
    const { data } = await supabase.functions.invoke("admin-request", { method: "GET" });
    setRequests(data?.requests ?? []);
  }

  useEffect(() => { load(); }, []);

  async function review(email, status) {
    setBusy((b) => ({ ...b, [email]: true }));
    try {
      await supabase.functions.invoke("admin-request", {
        method: "PATCH",
        body: { request_email: email, status },
      });
      await load();
      onUpdate?.();
    } finally {
      setBusy((b) => ({ ...b, [email]: false }));
    }
  }

  const pending = (requests ?? []).filter((r) => r.status === "pending");
  if (!pending.length) return null;

  return (
    <div className="rounded-2xl p-5 mb-8 border border-yellow-700/40 bg-yellow-900/10">
      <div className="text-base font-semibold text-yellow-400 mb-4">
        Pending Access Requests ({pending.length})
      </div>
      <div className="space-y-3">
        {pending.map((r) => (
          <div key={r.email} className="flex items-start gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base text-white truncate">{r.email}</div>
              {r.message && (
                <div className="text-sm text-zinc-400 mt-1 line-clamp-2">"{r.message}"</div>
              )}
              <div className="text-sm text-zinc-600 mt-1">
                {new Date(r.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => review(r.email, "approved")}
                disabled={busy[r.email]}
                className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => review(r.email, "denied")}
                disabled={busy[r.email]}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin page ───────────────────────────────────────────────────────────
export default function Admin() {
  const isAdmin = useAppStore((s) => s.isAdmin);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let unsub;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      unsub = supabase.auth.onAuthStateChange((_e, s) => {
        setUser(s?.user ?? null);
      }).data.subscription;
    })();
    return () => unsub?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    refreshEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  async function refreshEvents() {
    const { data: evs, error: eerr } = await supabase
      .from("events")
      .select("id,name,starts_at,ends_at,created_at,image_url")
      .order("created_at", { ascending: false });
    if (eerr) { setError(eerr.message); return; }
    setEvents(evs || []);
    if ((evs?.length ?? 0) && !selected) setSelected(evs[0].id);
  }

  const deleteEvent = async (eventId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone and will delete all associated data.")) return;
    setDeleting(true);
    setError("");
    try {
      const { error } = await supabase.functions.invoke("events-delete", { body: { event_id: eventId } });
      if (error) throw error;
      await refreshEvents();
      if (selected === eventId) {
        const remaining = events.filter((e) => e.id !== eventId);
        setSelected(remaining?.[0]?.id ?? null);
      }
      alert("Event deleted successfully");
    } catch (e) {
      setError(e?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selected) ?? null;
  const now = Date.now();
  const eventActive = selectedEvent
    ? now >= new Date(selectedEvent.starts_at).getTime() && now <= new Date(selectedEvent.ends_at).getTime()
    : false;
  const eventEnded = selectedEvent ? now > new Date(selectedEvent.ends_at).getTime() : false;
  const eventPending = selectedEvent ? now < new Date(selectedEvent.starts_at).getTime() : false;

  const copyEventLink = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/event/${selected}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert("Failed to copy: " + e.message);
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container-px mx-auto max-w-screen-xl pt-20 text-center">
        <div className="text-zinc-400 text-base">Please login to access the admin dashboard</div>
      </div>
    </div>
  );

  if (!isAdmin) return <AdminRequestPanel />;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="container-px mx-auto max-w-screen-xl pt-10 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-zinc-500 text-base mt-1">Manage events and access requests</p>
        </div>

        <PendingRequestsPanel onUpdate={refreshEvents} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="text-base font-semibold text-zinc-300 mb-4">Create Event</div>
              <CreateEventForm onCreated={refreshEvents} />
            </div>

            <div className="card p-6">
              <div className="text-base font-semibold text-zinc-300 mb-4">Events</div>
              <div className="space-y-2 max-h-[50vh] overflow-auto">
                {(events || []).map((ev) => (
                  <div
                    key={ev.id}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      selected === ev.id
                        ? "border-violet-600 bg-violet-600/10"
                        : "border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setSelected(ev.id)}
                    >
                      {ev.image_url ? (
                        <img
                          src={ev.image_url}
                          alt={ev.name}
                          className="h-12 w-12 rounded-lg object-cover border border-zinc-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-600 flex-shrink-0">
                          📅
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-base truncate text-white">{ev.name}</div>
                        <div className="text-sm text-zinc-500 truncate">
                          {new Date(ev.starts_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                        disabled={deleting}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                        title="Delete event"
                      >
                        {deleting ? "..." : "🗑️"}
                      </button>
                    </div>
                  </div>
                ))}
                {!events?.length && (
                  <div className="text-base text-zinc-500 py-4 text-center">No events yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right columns */}
          <div className="lg:col-span-2 space-y-6">
            {selected && (
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-white mb-1">Share Event</h3>
                <p className="text-base text-zinc-400 mb-5">
                  Share this link — attendees can scan the QR from their phone
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={`${window.location.origin}/event/${selected}`}
                    readOnly
                    className="w-full sm:flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base font-mono text-zinc-300 focus:outline-none"
                  />
                  <button
                    onClick={copyEventLink}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all whitespace-nowrap"
                  >
                    {copied ? "✓ Copied" : "Copy Link"}
                  </button>
                </div>
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl">
                  <div className="text-base text-blue-300">
                    💡 <strong>Pro tip:</strong> Display this link on a projector or TV so attendees can scan with their phones. The QR rotates automatically.
                  </div>
                </div>
              </div>
            )}

            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xl font-semibold text-white">Rotating QR Code</div>
                  <div className="text-sm text-zinc-500 mt-1">
                    Updates every 10 seconds · Expires in 30 seconds
                  </div>
                </div>
                {selected && (
                  <div className="text-sm text-zinc-400 font-mono bg-zinc-800 px-3 py-1.5 rounded-lg">
                    {selected.slice(0, 8)}...
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {!selected && (
                  <div className="flex items-center justify-center w-full max-w-xs h-64 sm:h-80 bg-zinc-900 rounded-2xl border border-zinc-700">
                    <div className="text-base text-zinc-500">Select an event</div>
                  </div>
                )}
                {selected && eventActive && <RotatingQR eventId={selected} />}
                {selected && eventEnded && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xs h-64 sm:h-80 bg-zinc-900 rounded-2xl border border-zinc-800 gap-3">
                    <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-center">
                      <div className="text-base font-medium text-zinc-400">Event ended</div>
                      <div className="text-sm text-zinc-600 mt-1">
                        {new Date(selectedEvent.ends_at).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {selected && eventPending && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xs h-64 sm:h-80 bg-zinc-900 rounded-2xl border border-zinc-800 gap-3">
                    <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-center">
                      <div className="text-base font-medium text-zinc-400">Not started yet</div>
                      <div className="text-sm text-zinc-600 mt-1">
                        Starts {new Date(selectedEvent.starts_at).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selected && <AttendancePanel eventId={selected} />}
          </div>
        </div>

        {error && (
          <div className="mt-6 text-base text-red-400 bg-red-900/20 border border-red-700/50 p-4 rounded-xl">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
