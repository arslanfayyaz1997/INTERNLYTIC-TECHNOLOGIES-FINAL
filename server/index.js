import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_RECEIVER, PORT = 5000 } = process.env;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn(
    "⚠️  GMAIL_USER or GMAIL_APP_PASSWORD is missing in server/.env — the /api/contact endpoint will fail until both are set."
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

console.log(
  `📧 Using Gmail account: ${GMAIL_USER || "(missing — set GMAIL_USER in server/.env)"} | app password length: ${
    GMAIL_APP_PASSWORD?.length ?? 0
  } chars (should be 16)`
);

// Verify SMTP credentials on startup so problems show up immediately in the logs
transporter.verify((error) => {
  if (error) {
    console.error("❌ Gmail SMTP connection failed:", error.message);
    console.error(
      "   Common causes: 2-Step Verification not enabled on this Google account, " +
        "the app password was revoked/regenerated, or GMAIL_USER doesn't match the " +
        "account the app password was created for."
    );
  } else {
    console.log("✅ Gmail SMTP connection ready — mail server can send emails");
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ ok: false, error: "Name, email, and message are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Please provide a valid email address." });
    }

    const receiver = CONTACT_RECEIVER?.trim() || GMAIL_USER;

    await transporter.sendMail({
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

    return res.json({ ok: true });
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
      debug, // remove this field before going to production
    });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`📬 Contact mail server running on http://localhost:${PORT}`);
});
