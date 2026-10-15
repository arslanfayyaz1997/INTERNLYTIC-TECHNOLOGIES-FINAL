# Internlytic Technologies — Master Project

This is the existing React + Vite website for Internlytic Technologies. Update this project in the **same GitHub repository** so the current Vercel domain and certificate/offer-letter verification link remain the same.

## What was updated in this package

- Added a third theme mode: light green/teal → light blue → dark → light green/teal.
- Theme choice is persisted in the browser and applied before the app renders.
- Login page now offers **Login as CEO** and **Login as an Intern**. Intern login requires Internship Intern ID, Internship Track, and Secret PIN.
- Added `/admin` CEO dashboard UI for intern records, filters, pending task submissions, and approve/request-changes controls.
- Added `/portal` intern dashboard UI for their profile, task submissions, review statuses, progress, and linked documents.
- Added `SUPABASE-PORTAL-SETUP.sql` and `SUPABASE-PORTAL-SETUP.md` for the portal database functions and safe setup instructions.
- Set the company contact email to `internlytictechnologies@gmail.com`.
- Set shared application form URL to `https://forms.gle/zNGnQWfTZMxNCuRc9`.
- Homepage founder section heading is now **Founder Portfolio**, with the requested developer/UX description; the duplicate “View My Portfolio” button was removed and the existing photo card / “Open My 3D Portfolio” link remains.
- Header login button now follows the active theme rather than being hard-coded green.
- Course “Buy Now” CTAs now use the shared Google Form.
- Added this guide and `SUPABASE-PORTAL-SETUP.md` to explain ongoing maintenance.
- Removed the local `.env` from the ZIP for security. Use `.env.example` as a template; set real values in your local environment and Vercel settings.

## Important status note about Supabase

The source ZIP does not contain the database schema or the existing PIN table definitions. The portal frontend and SQL RPC integration are prepared, but the login/dashboard cannot read your actual 70+ existing records until `SUPABASE-PORTAL-SETUP.md` is followed and your existing ID/PIN/track table is mapped into `intern_portal_access`. I did **not** guess table names or run destructive migrations. Existing `/verify` code and the `certificates` table query are preserved.

The task text/link workflow uses Supabase RPCs. Private task-file upload and short-lived signed URLs use `api/portal-files.js`; configure the server-only `SUPABASE_SERVICE_ROLE_KEY` in Vercel before testing file uploads. Do not enable public read access for intern documents.

## Quick start

Requirements: Node.js LTS and npm.

```bash
npm install
npm run dev
npm run build
```

## Folder-by-folder guide

```text
project root/
├── public/                      Static files: favicon, robots.txt
├── src/
│   ├── assets/                  Images, founder photo, logos, hero/workflow artwork
│   ├── components/              Shared components (header/footer, forms, dialogs, UI)
│   │   ├── layout.jsx            Header, navigation, theme toggle, footer
│   │   ├── InternshipApply.jsx   Shared Apply Now / Google Form link
│   │   ├── BuyNowDialog.jsx      Course CTA routed to shared Google Form
│   │   ├── AuthShell.jsx         Layout used by login
│   │   └── ui/                   Reusable buttons, inputs, cards, dialogs, tabs, etc.
│   ├── hooks/                    Reusable React hooks
│   ├── lib/
│   │   ├── siteConfig.js         Company email + Google Form URL
│   │   ├── theme.js              Theme cycle and persistence
│   │   ├── auth.js               Legacy local profile/auth helpers used by profile pages
│   │   └── internships.js        Internship labels and shared form URL
│   ├── pages/
│   │   ├── LoginPage.jsx         CEO/Intern login
│   │   ├── AdminDashboardPage.jsx CEO intern list + task review
│   │   ├── InternPortalPage.jsx  Intern's private portal UI
│   │   ├── VerifyCertificate.jsx Existing certificate/offer verification page
│   │   ├── ContactPage.jsx       Contact form; opens Gmail compose
│   │   ├── ApplyPage.jsx         Internship tracks and application information
│   │   ├── AboutPage.jsx         Company/About page
│   │   ├── CoursesPage.jsx       Courses and course CTAs
│   │   ├── ServicesPage.jsx      Service cards and contact/application CTAs
│   │   ├── ProfilePage.jsx       Existing profile page
│   │   └── FAQPage.jsx           FAQ content
│   ├── App.jsx                   Homepage and founder portfolio section
│   ├── main.jsx                  App entry point and route registration
│   ├── supabaseClient.js         Supabase browser client using Vite env variables
│   └── styles.css                Theme variables, layout, responsive design, animations
├── api/                          Optional Vercel serverless API handlers
├── server/                       Optional Express email server and setup notes
├── server.js                     Optional server entry point
├── index.html                    Browser title, SEO, favicon, initial page metadata
├── package.json                  Dependencies and npm scripts
├── .env.example                  Safe environment-variable template (no real secrets)
├── SUPABASE-PORTAL-SETUP.sql     Portal tables/RPCs; review before running
├── SUPABASE-PORTAL-SETUP.md      Portal setup and testing instructions
├── CONTACT-FORM-SETUP.md         Contact and optional email service notes
└── README.md                     This guide
```

## How to change common things

### Change company Gmail or Google Form
1. Open `src/lib/siteConfig.js`.
2. Edit `contactEmail` and/or `googleFormUrl`.
3. Save and commit. The Contact page uses Gmail compose with the configured recipient; the visitor must still press **Send** in Gmail.
4. Shared Apply Now buttons and course Buy Now buttons use the configured Google Form.

Current values:
- Contact email: `internlytictechnologies@gmail.com`
- Application form: `https://forms.gle/zNGnQWfTZMxNCuRc9`

### Change theme colors
Open `src/styles.css`:
- Main `:root` block = light green/teal theme.
- `:root[data-theme="forest"]` = light blue theme.
- `:root[data-theme="dark"]` = dark theme.
Edit semantic values such as `--background`, `--foreground`, `--card`, `--primary`, `--primary-foreground`, `--muted-foreground`, and `--border` together so contrast stays readable.
The cycle/persistence logic is in `src/lib/theme.js`; the clickable moon/theme control is in `src/components/layout.jsx` → `ThemeToggle`.

### Change logo and founder photo
- Header logo: replace `src/assets/internlytic-mark.png`, keeping the same filename.
- Browser tab icon: `public/favicon.png`.
- Homepage founder image: `src/assets/arslan-founder-photo.jpg` or `src/assets/partner-arslan.jpg` depending on the section.
- Homepage copy: `src/App.jsx`.
- About page copy: `src/pages/AboutPage.jsx`.

### Change homepage founder section
Open `src/App.jsx`, search for `Founder Portfolio`. The text, founder card, and personal portfolio link are in that section. The right-side “Open My 3D Portfolio” link is intentionally retained.

### Change form fields or contact behavior
- Contact fields and Gmail compose flow: `src/pages/ContactPage.jsx`.
- Shared application link/button: `src/components/InternshipApply.jsx`.
- Internship tracks and labels: `src/lib/internships.js` and `src/pages/ApplyPage.jsx`.
- Course CTA: `src/components/BuyNowDialog.jsx` and `src/pages/CoursesPage.jsx`.
- The Gmail compose flow pre-fills recipient, subject, and message; it does not silently send email.

### Add offer letters, certificates, or LoRs
The intern dashboard reads document links from the mapped portal record fields:
- `offer_letter_url`
- `certificate_url`
- `lor_url`

For each existing intern, set the corresponding URL in `intern_portal_access` after following `SUPABASE-PORTAL-SETUP.md`. Use stable links or private signed URLs; avoid public links for sensitive documents. Certificate verification at `/verify` remains separate and was not replaced.

### Where submitted tasks appear
- Intern submits from `/portal`.
- Task metadata is stored in `public.intern_task_submissions`.
- CEO reviews at `/admin`.
- New submissions start as `Pending`; the intern sees `Approved` only after the CEO approves it.
- Progress is based on approved tasks and the configured `required_tasks` count.
- Secure file previews require a private storage + signed-URL mechanism; the setup guide explains this limitation.

### Update through GitHub and keep the same website URL
1. Open the **existing** repository `arslanfayyaz1997/INTERNLYTIC-TECHNOLOGIES-FINAL`.
2. Upload/replace the updated project files in that repository. Do not create a new repository.
3. Do not commit `.env` or any secret keys. Use Vercel → Project Settings → Environment Variables for real values.
4. Confirm Vercel is still connected to this same repository and project.
5. After deployment, test the existing verification link, `/login`, `/admin`, `/portal`, contact email link, application buttons, and all three themes.

Existing certificate verification route `/verify` and its `certificates` table query were intentionally retained.
