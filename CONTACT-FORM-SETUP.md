# Internlytic Contact & Application Setup

## 1. Add your new Gmail and Google Form

Open `src/lib/siteConfig.js`. This is the one place for the public links:

```js
export const siteConfig = {
  companyName: "Internlytic Technologies",
  contactEmail: "your-new-internlytic-gmail@gmail.com",
  googleFormUrl: "https://forms.gle/YOUR_NEW_FORM_ID",
};
```

Replace both example values with your real new company Gmail and Google Form URL. Keep the quotes.

## 2. How the Contact form works

The Contact page collects name, email, subject, and message. When someone clicks **Open Gmail & Send Message**, the site opens Gmail in a new tab and pre-fills the recipient, subject, and message. The visitor must review the email and press **Send** in Gmail. This is a mail-compose flow, not automatic sending.

## 3. Apply Now buttons

All shared **Apply Now** buttons use `siteConfig.googleFormUrl`. After adding your new Google Form URL, the buttons open that form in a new tab. If the URL is still blank, the site shows a reminder instead of sending visitors to the previous application form.

## 4. Optional course enrollment email server

The separate **Buy Now** course dialog still uses the Express email endpoint. If you want that feature to send emails, configure these environment variables on the host where `server.js` runs:

- `GMAIL_USER` — the new Internlytic Gmail account
- `GMAIL_APP_PASSWORD` — an App Password generated in that Google account
- `CONTACT_RECEIVER` — where enrollment emails should arrive (usually the same Gmail)

Never commit `.env.local` or a Gmail App Password to GitHub. Contact form submissions do not require these server credentials because they open Gmail compose directly.
