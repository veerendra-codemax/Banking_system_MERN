import nodemailer from "nodemailer";

// If SMTP credentials are not configured, falls back to logging the email
// to the console so the app is fully usable in local development without
// a real mail provider.
const sendEmail = async ({ to, subject, html, text }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("\n----- DEV EMAIL (SMTP not configured) -----");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log("---------------------------------------------\n");
    return { devMode: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to,
    subject,
    html,
    text,
  });

  return { devMode: false };
};

export default sendEmail;
