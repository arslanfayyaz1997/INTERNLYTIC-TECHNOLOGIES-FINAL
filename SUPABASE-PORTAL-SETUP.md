# Internlytic Technologies — Supabase Portal Setup

> Read this before deploying. The ZIP has the portal UI and RPC integration, but the uploaded ZIP cannot tell us the exact table/column names where your existing PINs and intern records are stored. This setup adds a dedicated portal access mapping table without deleting existing data. Do not run destructive SQL.

## Important: preserve your current data
- Keep your existing `certificates` table and `/verify` route unchanged.
- Do not delete or recreate your existing 70+ records.
- `intern_portal_access` is a portal-access mapping table, not a replacement for your existing intern/certificate records. To make every existing intern available, map their current ID, name, email, track, and PIN into this table. We must match the actual current source table before running any bulk `INSERT ... SELECT`; table/column names must not be guessed.
- The portal stores PINs as bcrypt hashes. The secret PIN itself is never returned by the RPC.

## 1. Run the SQL additions
1. Open Supabase Dashboard → SQL Editor.
2. Open `SUPABASE-PORTAL-SETUP.sql` from this project.
3. Review it, then run it.
4. This creates `intern_portal_access`, `intern_task_submissions` and the portal RPC functions. It does not change your existing certificate table.

## 2. Add the CEO access row
Use the CEO email already configured for this project: `arslanfayyaz1997@gmail.com`. The CEO PIN is hashed when inserted. Replace `REPLACE_WITH_YOUR_EXISTING_CEO_PIN` locally in the SQL Editor and run it; do not commit the PIN to GitHub:

```sql
insert into public.intern_portal_access
  (role, email, full_name, secret_pin_hash)
values
  ('ceo', 'arslanfayyaz1997@gmail.com', 'Arslan Fayyaz',
   crypt('REPLACE_WITH_YOUR_EXISTING_CEO_PIN', gen_salt('bf')))
on conflict (lower(email)) where role='ceo'
do update set secret_pin_hash=excluded.secret_pin_hash, active=true;
```

If the unique partial index causes an `ON CONFLICT` syntax issue in your Postgres version, use a simple `UPDATE` first, then `INSERT` only if no CEO row exists.

## 3. Map existing intern IDs, tracks, and PINs
The ZIP does not include Supabase table definitions, so I have intentionally not guessed the table where your saved PINs live. Before bulk-mapping the existing 70+ people, open Supabase → Table Editor and identify the table/columns containing the existing intern ID, name, email, track, and PIN. Use that exact schema to map the records into `intern_portal_access`. For each row, use `crypt(existing_pin, gen_salt('bf'))` to hash the PIN. Keep the original records and IDs intact. If the PINs are already hashed, do not hash the hash again.

Example for a single record (replace placeholders locally, never commit real PINs):
```sql
insert into public.intern_portal_access
  (role, intern_id, full_name, email, track, secret_pin_hash, certificate_id)
values
  ('intern', 'INTERN-ID-HERE', 'INTERN NAME', 'intern@example.com',
   'UX/UI', crypt('EXISTING_PIN_HERE', gen_salt('bf')), 'CERTIFICATE-ID-HERE')
on conflict (intern_id) do update set
  full_name=excluded.full_name, email=excluded.email, track=excluded.track,
  secret_pin_hash=excluded.secret_pin_hash, certificate_id=excluded.certificate_id,
  active=true;
```
**Do not create duplicate Supabase Auth users.** This table is only a mapping for portal login and uses the existing assigned IDs/PINs. The bulk migration query must be tailored to the real table schema first.

## 4. Documents
The portal reads document URLs from `offer_letter_url`, `certificate_url`, and `lor_url` in `intern_portal_access`. For now, add the existing offer-letter PDF URL to the matching intern row. When certificates/LoRs are ready later, add their URLs to the same row. Prefer a private Supabase Storage bucket and short-lived signed URLs for confidential documents; do not make a bucket public just to make links work.

## 5. Task submissions and file privacy
- Task text and link submissions are written to `intern_task_submissions` via the `portal_submit_task` RPC and start with `Pending`.
- Admin reviews submissions in the Admin Dashboard. `Approved` and `Needs Changes` can only be set through the admin RPC after CEO credentials are checked.
- The SQL creates a private `intern-task-submissions` bucket. The `api/portal-files.js` Vercel serverless endpoint verifies the portal credentials through the `portal_login` RPC, uploads files server-side, and returns short-lived signed URLs. Do not add broad anonymous Storage read policies: they would expose interns' files.
- Set `SUPABASE_SERVICE_ROLE_KEY` as a **server-side Vercel environment variable only** (never prefix it with `VITE_`, never put it in frontend code, and never commit it). The API uses it only on the server. Keep the upload limit at 3 MB per file because Vercel serverless request bodies have limits.

## 6. Verify the system
1. Open `/login`.
2. Choose **Login as CEO**, enter the CEO Gmail and existing CEO PIN.
3. Choose **Login as an Intern**, enter the existing Intern ID, exact track, and existing PIN.
4. Try an incorrect PIN and confirm that login is rejected.
5. Confirm `/verify` still works with a previously working certificate/offer-letter ID.
6. Submit a task with a title and link. It should appear as Pending in the admin review list.
7. Approve it from the admin dashboard; refresh the intern dashboard and confirm the status/progress changes.

## 7. Deployment and secrets
- Keep the existing Vercel project and same domain/repository.
- Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_ADMIN_EMAIL` in Vercel → Project → Settings → Environment Variables.
- Also set `SUPABASE_SERVICE_ROLE_KEY` as a server-only environment variable for `/api/portal-files` (do not expose it in any `VITE_*` variable). The ZIP deliberately excludes `.env` because local environment files may contain credentials.
- Never put a Supabase service-role key in `VITE_*` variables or client-side code.
- If Vercel is already linked to the same GitHub repository, pushing the updated files to that repository should trigger deployment.
