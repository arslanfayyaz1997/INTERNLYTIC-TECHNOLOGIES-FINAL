# Internlytic Technologies

A responsive internship and technology-learning platform built with React, Vite, Tailwind CSS, and reusable UI components. The site includes internship tracks, services, courses, application routes, a founder section, contact page, account/profile pages, FAQs, and a two-theme color switcher.

## Brand & theme

- **Company:** Internlytic Technologies
- **Founder:** Arslan Fayyaz — Founder | CEO
- **Logo asset:** `src/assets/internlytic-mark.png`
- **Header/footer brand:** `src/components/layout.jsx` (`Brand` component)
- **Theme colors:** `src/styles.css`
- **Theme persistence/toggle:** `src/lib/theme.js` and `src/components/layout.jsx`
- **Theme 1:** Internlytic teal/green, matching the logo
- **Theme 2:** light blue

## Quick start

Requirements: Node.js (LTS recommended) and npm.

```bash
npm install
npm run dev
```

Vite will print the local URL. To create a production build:

```bash
npm run build
npm run preview
```

## The most useful files to edit

| What you want to change | File |
|---|---|
| New Gmail address and Google Form URL | `src/lib/siteConfig.js` |
| Header/footer logo and company name | `src/components/layout.jsx` |
| Homepage content, founder card, and 3D portfolio section | `src/App.jsx` |
| Header navigation link for My Portfolio | `src/components/layout.jsx` (`navItems`) |
| About page copy and founder card | `src/pages/AboutPage.jsx` |
| Contact form fields and Gmail compose behavior | `src/pages/ContactPage.jsx` |
| Shared Apply Now button behavior | `src/components/InternshipApply.jsx` |
| Internship track titles and metadata | `src/lib/internships.js` |
| All main site colors, gradients, founder-card layout | `src/styles.css` |
| Browser tab title, SEO description, favicon links | `index.html` |
| Footer and social link settings | `src/components/layout.jsx` |
| FAQ content | `src/pages/FAQPage.jsx` |
| Privacy and Terms copy | `src/pages/LegalPage.jsx` |
| Service cards | `src/pages/ServicesPage.jsx` |
| Course cards | `src/pages/CoursesPage.jsx` |
| Internship apply page | `src/pages/ApplyPage.jsx` |

## Add your new Gmail and Google Form

Open `src/lib/siteConfig.js` and set:

```js
export const siteConfig = {
  companyName: "Internlytic Technologies",
  contactEmail: "your-new-internlytic-gmail@gmail.com",
  googleFormUrl: "https://forms.gle/YOUR_NEW_FORM_ID",
};
```

Use your actual Gmail address and Google Form link. All shared **Apply Now** buttons use the configured Google Form. The Contact page opens Gmail in a new tab with the recipient, subject, name, email, and message pre-filled; the visitor still needs to press **Send** in Gmail.

## Change the logo

Replace `src/assets/internlytic-mark.png` with your new transparent PNG logo. Keep the same filename to avoid editing import paths. The browser tab icon is `public/favicon.png`.

## Change the company name

The header/footer name is in the `Brand` component inside `src/components/layout.jsx`. Update the page title and SEO text in `index.html` too. Search the project for `Internlytic Technologies` if you want to change the name in all descriptions and footer text.

## Change the two color themes

Open `src/styles.css`:

- The main `:root { ... }` block controls the first teal/green theme.
- The `:root[data-theme="forest"] { ... }` block controls the second light-blue theme.
- Near the bottom, the `:root:not([data-theme="forest"])` and `:root[data-theme="forest"]` rules control the section gradients for each theme.

The header theme button is in `ThemeToggle` inside `src/components/layout.jsx`. It stores the selected mode in browser local storage.

## Update the founder card

- Homepage founder card and description: `src/App.jsx`, in `foundingPartners` and the `founding-partners` section.
- About page founder card and description: `src/pages/AboutPage.jsx`, in `founders` and the “Meet the Founder” section.
- Founder photo: `src/assets/partner-arslan.jpg`. Replace that image with your own updated photo if needed, keeping the filename.

Only Arslan Fayyaz is listed as Founder | CEO. The previous additional founder cards and portraits have been removed from the visible site.

## Contact and application setup

Read `CONTACT-FORM-SETUP.md` for the Gmail compose behavior, Google Form settings, and optional server email setup used by the separate course enrollment dialog.

## Deploying

Push the updated project to GitHub and import/update the same repository in Vercel or your chosen host. For a frontend-only Vercel deployment, the Contact form's Gmail compose flow and Google Form links work without a mail server. The separate course enrollment endpoint needs its server environment variables configured if you keep that feature enabled.

## Folder-by-folder guide

```text
color-change-main/
├── public/                 Browser icons and static files
├── src/
│   ├── assets/             Photos, workflow images, and the Internlytic logo
│   ├── components/         Shared header, footer, buttons, dialogs, and UI pieces
│   ├── hooks/              Reusable React hooks
│   ├── lib/                Site settings, theme logic, auth helpers, and internship data
│   ├── pages/              Individual pages such as Home, About, Contact, Courses, FAQ
│   ├── App.jsx             Homepage sections and main landing-page content
│   ├── main.jsx            React entry point and route setup
│   └── styles.css          Theme colors, gradients, layout, responsive styles, animations
├── api/                    Serverless API handlers used by optional server features
├── server/                 Optional Express email server and its documentation
├── server.js               Express server entry point
├── index.html              Browser title, SEO metadata, favicon, and theme startup
├── package.json            Project scripts and dependencies
├── README.md               This guide
└── CONTACT-FORM-SETUP.md   Gmail, Google Form, and optional email-server instructions
```

### Step-by-step: change your new Gmail and application form

1. Open `src/lib/siteConfig.js`.
2. Put your new company Gmail in `contactEmail`.
3. Put your new Google Form share link in `googleFormUrl`.
4. Save and commit the file.
5. Test the Contact page: fill the form and click **Open Gmail & Send Message**. Gmail should open with the recipient and message filled in; press **Send** yourself.
6. Test several **Apply Now** buttons. They should all open your new Google Form in another tab.

### Step-by-step: change the logo or founder photo

1. Replace `src/assets/internlytic-mark.png` with your transparent logo, keeping the exact filename.
2. Replace `public/favicon.png` with a small square version of the same logo if you want the browser tab icon to match.
3. Replace `src/assets/partner-arslan.jpg` with your updated founder photo, keeping the exact filename.
4. Open `src/App.jsx` for the homepage Founder section or `src/pages/AboutPage.jsx` for the About-page Founder section if you want to change the description or title.

### Step-by-step: change theme colors

1. Open `src/styles.css`.
2. Edit the main `:root` block to change the first teal/green theme. The most important variables are `--primary`, `--secondary`, `--accent`, `--brand-teal`, `--surface-mint`, and `--hero`.
3. Edit `:root[data-theme="forest"]` to change the second light-blue theme.
4. Scroll near the bottom to adjust the theme-specific hero and section gradients.
5. Save, reload the site, and click the theme switcher in the header to check both modes.

**Header brand color behavior:** The brand name is split into `Intern` and `lytic`. `Intern` stays dark in the light header (and white on dark footer areas), while `lytic` automatically follows the active theme's primary color. The logo mark also shifts from teal/green to light blue when the blue theme is selected. These behaviors are handled by the `Brand` component in `src/components/layout.jsx` and the `.internlytic-brand-mark` rules near the bottom of `src/styles.css`.

### Step-by-step: change company wording or add social links

1. Header and footer brand text is in the `Brand` component in `src/components/layout.jsx`.
2. The browser tab title and search-engine description are in `index.html`.
3. The old company social profiles have been removed from the footer. When your new company profiles are ready, add them to the `socialLinks` array in `src/components/layout.jsx`.
4. Search for `Internlytic Technologies` in the repository to find other page copy that uses the company name.


## Founder 3D Portfolio section
You can find the section on the homepage **immediately after the main hero banner and before the internship tracks**. I also added **My Portfolio** to the top navigation (and mobile menu), so you can click it to jump to the section.


The homepage includes a **My Portfolio / 3D Portfolio** section linking to Arslan Fayyaz’s personal portfolio. Both the main button and the preview card open the portfolio in a new browser tab.

- **File:** `src/App.jsx`
- **Search for:** `https://porfolio-arslanfayyaz.vercel.app/`
- **To update the URL:** replace that URL in both links in the `my-portfolio` section. Keep the `https://` prefix and trailing slash if the destination uses one.
- **To edit the description:** search for `Discover my personal work` in the same file and replace that paragraph.
- **To change the section title:** search for `Explore Arslan Fayyaz’s` in the same file.


### Founder Portfolio photo
- The Founder Portfolio preview card uses `src/assets/arslan-founder-photo.jpg`.
- To replace your photo later, keep the same filename and overwrite that image, or update the `arslanFounderPhoto` import in `src/App.jsx`.
- The photo is displayed inside the clickable portfolio card; clicking the card opens your 3D portfolio URL.

### Founder Portfolio card

The Founder Portfolio card on the homepage shows Arslan Fayyaz's photo first, followed by the name, then separate role lines (`Full Stack - MERN Developer` and `UI/UX Designer`), and an **Open My 3D Portfolio** button. The button opens `https://porfolio-arslanfayyaz.vercel.app/` in a new tab.

- Photo: `src/assets/arslan-founder-photo.jpg`
- Card markup and portfolio link: `src/App.jsx`, inside the `id="my-portfolio"` section.
- To change the portfolio destination, update the button's `href` in that section.

