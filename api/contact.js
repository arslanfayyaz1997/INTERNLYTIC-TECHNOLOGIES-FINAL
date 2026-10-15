import nodemailer from "nodemailer";

const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_RECEIVER } = process.env;

// Reused across warm serverless invocations
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables");
    return res.status(500).json({
      ok: false,
      error: "Mail server isn't configured yet.",
      debug: "GMAIL_USER or GMAIL_APP_PASSWORD not set in Vercel Environment Variables",
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
}
