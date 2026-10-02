import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Loads credentials from .env.local (falls back to .env if present)
dotenv.config({ path: ".env.local" });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_RECEIVER, PORT } = process.env;

// Reused across requests instead of reconnecting every time
let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post("/api/contact", async (req, res) => {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables");
    return res.status(500).json({
      ok: false,
      error: "Mail server isn't configured yet.",
      debug: "GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local",
    });
  }

  try {
    const { name, email, subject, message } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ ok: false, error: "Name, email, and message are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Please provide a valid email address." });
    }

    const receiver = CONTACT_RECEIVER?.trim() || GMAIL_USER;

    await getTransporter().sendMail({
      from: `"Internlytic Website" <${GMAIL_USER}>`,
      to: receiver,
      replyTo: email,
      subject: `[Contact Form] ${subject?.trim() || "New message from " + name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "(none)"}\n\nMessage:\n${message}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "(none)"}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to send contact email:", {
      message: err.message,
      code: err.code,
      responseCode: err.responseCode,
      response: err.response,
    });
    const debug = [err.code, err.responseCode, err.response || err.message].filter(Boolean).join(" | ");
    return res.status(500).json({
      ok: false,
      error: "Something went wrong sending your message. Please try again.",
      debug, // remove once everything is confirmed working
    });
  }
});

// Separate endpoint for the "Buy Now" enrollment form on the Courses page.
// Kept independent from /api/contact on purpose, even though it reuses the
// same Gmail account/transporter, so the two forms can evolve separately.
app.post("/api/enroll", async (req, res) => {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables");
    return res.status(500).json({
      ok: false,
      error: "Mail server isn't configured yet.",
      debug: "GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local",
    });
  }

  try {
    const { name, email, phone, course, message } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !course?.trim()) {
      return res.status(400).json({ ok: false, error: "Name, email, phone, and course are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Please provide a valid email address." });
    }

    const receiver = CONTACT_RECEIVER?.trim() || GMAIL_USER;

    await getTransporter().sendMail({
      from: `"Internlytic Website" <${GMAIL_USER}>`,
      to: receiver,
      replyTo: email,
      subject: `[Buy Now] ${course} — ${name}`,
      text: `Course: ${course}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message || "(none)"}`,
      html: `
        <h2>New course purchase enquiry</h2>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message || "(none)").replace(/\n/g, "<br/>")}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to send enrollment email:", {
      message: err.message,
      code: err.code,
      responseCode: err.responseCode,
      response: err.response,
    });
    const debug = [err.code, err.responseCode, err.response || err.message].filter(Boolean).join(" | ");
    return res.status(500).json({
      ok: false,
      error: "Something went wrong sending your enrollment. Please try again.",
      debug, // remove once everything is confirmed working
    });
  }
});

// In production, this same server also serves the built frontend (npm run build first)
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("No dist/ folder found yet — this server is only handling /api/contact for now.");
  console.log("Run `npm run dev` in another terminal for the frontend with hot reload.");
}

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Internlytic server running at http://localhost:${port}`);
});
