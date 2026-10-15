import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (res, status, body) => { res.setHeader("Content-Type", "application/json"); return res.status(status).json(body); };

export default async function handler(req, res) {
  Object.entries(cors).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "POST required." });
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(res, 500, { ok: false, error: "Server-side Supabase environment variables are not configured." });
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    const body = req.body || {};
    const { action, role, email, intern_id, track, pin } = body;
    let auth;
    if (role === "ceo") {
      auth = await db.rpc("portal_login", { p_role: "ceo", p_email: email, p_intern_id: null, p_track: null, p_pin: pin });
    } else {
      auth = await db.rpc("portal_login", { p_role: "intern", p_email: null, p_intern_id: intern_id, p_track: track, p_pin: pin });
    }
    if (auth.error) return json(res, 500, { ok: false, error: "Portal authentication could not be checked." });
    const identity = Array.isArray(auth.data) ? auth.data[0] : auth.data;
    if (!identity?.ok) return json(res, 401, { ok: false, error: "Portal credentials are invalid." });

    const bucket = "intern-task-submissions";
    if (action === "upload") {
      if (identity.role !== "intern") return json(res, 403, { ok: false, error: "Only interns can upload task files." });
      const filename = String(body.filename || "task-file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
      const contentType = String(body.contentType || "application/octet-stream").slice(0, 120);
      const base64 = String(body.base64 || "");
      if (!base64 || base64.length > 4_000_000) return json(res, 413, { ok: false, error: "Choose a file smaller than about 3 MB." });
      const filePath = `${identity.intern_id}/${Date.now()}-${filename}`;
      const bytes = Buffer.from(base64, "base64");
      const { error } = await db.storage.from(bucket).upload(filePath, bytes, { contentType, upsert: false });
      if (error) return json(res, 400, { ok: false, error: error.message });
      return json(res, 200, { ok: true, file_path: filePath });
    }
    if (action === "signed-url") {
      const path = String(body.file_path || "");
      if (!path || (identity.role === "intern" && !path.startsWith(`${identity.intern_id}/`))) {
        return json(res, 403, { ok: false, error: "You are not allowed to open this file." });
      }
      const { data, error } = await db.storage.from(bucket).createSignedUrl(path, 90);
      if (error) return json(res, 404, { ok: false, error: "File not found or signed URL unavailable." });
      return json(res, 200, { ok: true, url: data.signedUrl });
    }
    return json(res, 400, { ok: false, error: "Unknown file action." });
  } catch {
    return json(res, 500, { ok: false, error: "Unable to process the file request." });
  }
}
