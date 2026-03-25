// supabase/functions/admin-request/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Content-Type": "application/json",
};

const PROJECT_URL = Deno.env.get("project_url")!;
const ANON_KEY = Deno.env.get("product_anon_key")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(PROJECT_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
    }

    // POST — any logged-in user submits a request
    if (req.method === "POST") {
      // Check not already an admin
      const { data: adminRow } = await supabase
        .from("admins").select("email").eq("email", user.email).maybeSingle();
      if (adminRow) {
        return new Response(JSON.stringify({ error: "Already an admin" }), { status: 400, headers: cors });
      }

      const body = await req.json().catch(() => ({}));
      const message = body?.message ?? null;

      // Upsert — re-submission after denial resets to pending
      const { error } = await supabase.from("admin_requests").upsert(
        { email: user.email, message, status: "pending" },
        { onConflict: "email" }
      );
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
      }

      // Notify owner by email (requires RESEND_API_KEY secret to be set)
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "POAP <onboarding@resend.dev>",
            to: "mabejo2005@gmail.com",
            subject: "New Admin Access Request",
            html: `
              <h2>New Admin Request</h2>
              <p><strong>${user.email}</strong> has requested admin access.</p>
              ${message ? `<p>Their message: <em>"${message}"</em></p>` : ""}
              <p>Log in to your admin dashboard to approve or deny.</p>
            `,
          }),
        }).catch(() => {}); // fire-and-forget — never fail the main request over email
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    }

    // GET — admins fetch all requests; non-admins fetch their own status
    if (req.method === "GET") {
      const { data: adminRow } = await supabase
        .from("admins").select("email").eq("email", user.email).maybeSingle();

      if (adminRow) {
        // Admin: return all requests ordered newest first
        const { data, error } = await supabase
          .from("admin_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
        return new Response(JSON.stringify({ requests: data }), { status: 200, headers: cors });
      } else {
        // Non-admin: return their own request status
        const { data, error } = await supabase
          .from("admin_requests").select("*").eq("email", user.email).maybeSingle();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
        return new Response(JSON.stringify({ request: data }), { status: 200, headers: cors });
      }
    }

    // PATCH — only the owner email can approve or deny requests
    if (req.method === "PATCH") {
      if (user.email !== "mabejo2005@gmail.com") {
        return new Response(JSON.stringify({ error: "Forbidden - only the owner can approve requests" }), { status: 403, headers: cors });
      }

      const body = await req.json().catch(() => ({}));
      const { request_email, status } = body ?? {};
      if (!request_email || !["approved", "denied"].includes(status)) {
        return new Response(JSON.stringify({ error: "request_email and status (approved|denied) required" }), { status: 400, headers: cors });
      }

      const { error: updErr } = await supabase
        .from("admin_requests")
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user.email })
        .eq("email", request_email);
      if (updErr) return new Response(JSON.stringify({ error: updErr.message }), { status: 500, headers: cors });

      // If approved, insert into admins table
      if (status === "approved") {
        const { error: insErr } = await supabase
          .from("admins")
          .upsert({ email: request_email }, { onConflict: "email" });
        if (insErr) return new Response(JSON.stringify({ error: insErr.message }), { status: 500, headers: cors });
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    }

    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unhandled", detail: String(e?.message ?? e) }), { status: 500, headers: cors });
  }
});
