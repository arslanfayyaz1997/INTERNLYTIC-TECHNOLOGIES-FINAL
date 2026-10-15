# Contact Form Mail Server

Small Express server that receives the contact form submission from the site
and emails it to your Gmail inbox using an app password (Gmail SMTP).

## 1. Fill in `.env`

Open `server/.env` — the app password is already filled in, but you must add
the Gmail address it belongs to:

```
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=buyocupiodkjfvko   # already filled in
CONTACT_RECEIVER=                     # optional — leave empty to receive at GMAIL_USER
PORT=5000
```

`GMAIL_USER` must be the exact Gmail address you generated this app password
for — Gmail SMTP will reject the login otherwise.

## 2. Install & run

```
cd server
npm install
npm start
```

You should see:
```
✅ Gmail SMTP connection ready — mail server can send emails
📬 Contact mail server running on http://localhost:5000
```

If instead you see `❌ Gmail SMTP connection failed`, double check:
- `GMAIL_USER` matches the account the app password was generated for
- 2-Step Verification is turned on for that Google account (required for app passwords)
- The app password wasn't revoked in your Google Account → Security → App passwords

## 3. Run the site alongside it

In a separate terminal, from the project root:

```
npm run dev
```

The frontend (port 8080) proxies `/api/contact` requests to this server
(port 5000) automatically — see `vite.config.js`.

## 4. Deploying

When you deploy the site, deploy this `server/` folder too (e.g. as a small
Node service on Render/Railway/a VPS) and point the frontend's `/api` calls
at its real URL instead of relying on the Vite dev proxy — e.g. by setting a
`VITE_API_URL` env var and using it in `ContactPage.jsx` in place of the
relative `/api/contact` path.

## Security note

`.env` holds a live credential — never commit it to a public repo. A
`.gitignore` entry is included for this.
