// src/components/CreateEventForm.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

const NAME_MAX = 100;

export default function CreateEventForm({ onCreated }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageSizeWarn, setImageSizeWarn] = useState(false);

  function publicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Event name is required";
    else if (name.length > NAME_MAX) errs.name = `Max ${NAME_MAX} characters`;
    if (!start) errs.start = "Start time is required";
    if (!end) errs.end = "End time is required";
    else if (start && new Date(end) <= new Date(start)) errs.end = "End must be after start";
    return errs;
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setImageSizeWarn(!!f && f.size > 5 * 1024 * 1024);
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      // 1) Create event via edge function (this creates event + QR keys)
      const { data, error } = await supabase.functions.invoke("events-create", {
        body: {
          name,
          starts_at: new Date(start).toISOString(),
          ends_at: new Date(end).toISOString(),
        },
      });
      if (error) throw error;
      const eventId = data?.event_id;
      if (!eventId) throw new Error("Event id not returned from events-create");

      // 2) Upload image to bucket `poap` (if provided)
      let imageUrl = null;
      if (file) {
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const contentType = file.type || (ext === "jpg" ? "image/jpeg" : `image/${ext}`);
        const imgPath = `events/${eventId}/image.${ext}`;
        const { error: upErr } = await supabase.storage.from("poap").upload(imgPath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType,
        });
        if (upErr) throw upErr;
        imageUrl = publicUrl("poap", imgPath);
      }

      // 3) Build metadata.json with the uploaded image
      const metadata = {
        name,
        symbol: "POAP",
        description: `Proof of attendance: ${name}`,
        image: imageUrl || "https://dummyimage.com/512x512/333333/ffffff.png&text=POAP",
        attributes: [
          { trait_type: "Event", value: name },
          { trait_type: "StartsAt", value: new Date(start).toISOString() },
          { trait_type: "EndsAt", value: new Date(end).toISOString() },
        ],
      };
      const metaPath = `events/${eventId}/metadata.json`;
      const metaBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
      const { error: metaErr } = await supabase.storage.from("poap").upload(metaPath, metaBlob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/json",
      });
      if (metaErr) throw metaErr;
      const metadataUri = publicUrl("poap", metaPath);

      // 4) Update event row with image_url + metadata_uri
      const upd = await supabase
        .from("events")
        .update({ image_url: imageUrl, metadata_uri: metadataUri })
        .eq("id", eventId)
        .select("id, image_url, metadata_uri")
        .single();
      if (upd.error) throw new Error("Update failed: " + upd.error.message);
      if (!upd.data?.id) throw new Error("Update touched 0 rows — event_id mismatch?");

      // 5) Reset form and notify parent
      setName("");
      setStart("");
      setEnd("");
      setFile(null);
      setFieldErrors({});
      setImageSizeWarn(false);
      onCreated?.({ id: eventId, name, image_url: imageUrl, metadata_uri: metadataUri });
    } catch (e) {
      setErr(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "w-full bg-zinc-800 border rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-violet-500 transition-colors";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <div className="relative">
          <input
            className={`${inputClass} ${fieldErrors.name ? "border-red-500" : "border-zinc-700"}`}
            type="text"
            placeholder="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX + 10}
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${name.length > NAME_MAX ? "text-red-400" : "text-zinc-500"}`}>
            {name.length}/{NAME_MAX}
          </span>
        </div>
        {fieldErrors.name && <div className="text-sm text-red-500 mt-1">{fieldErrors.name}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <input
            className={`${inputClass} ${fieldErrors.start ? "border-red-500" : "border-zinc-700"}`}
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          {fieldErrors.start && <div className="text-sm text-red-500 mt-1">{fieldErrors.start}</div>}
        </div>
        <div>
          <input
            className={`${inputClass} ${fieldErrors.end ? "border-red-500" : "border-zinc-700"}`}
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          {fieldErrors.end && <div className="text-sm text-red-500 mt-1">{fieldErrors.end}</div>}
        </div>
      </div>

      <div>
        <input
          className={`${inputClass} border-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white hover:file:bg-primary-500`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {imageSizeWarn && (
          <div className="text-xs text-yellow-500 mt-1">
            Image is over 5MB — uploads may be slow.
          </div>
        )}
      </div>

      <button className="w-full py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all disabled:opacity-50" disabled={busy}>
        {busy ? "Creating..." : "Create Event"}
      </button>
      {err && <div className="text-sm text-red-500">{err}</div>}
    </form>
  );
}
