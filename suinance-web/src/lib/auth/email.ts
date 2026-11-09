import "server-only";
import { Resend } from "resend";

type Kind = "verify_email" | "reset_password";

const copy: Record<Kind, { subject: string; heading: string; body: string }> = {
  verify_email: {
    subject: "Your Suinance verification code",
    heading: "Confirm your email",
    body: "Enter this code on Suinance to verify your email address and finish creating your account.",
  },
  reset_password: {
    subject: "Your Suinance password reset code",
    heading: "Reset your password",
    body: "Enter this code on Suinance to choose a new password. If you did not ask for this, you can ignore this email.",
  },
};

function html(name: string, code: string, kind: Kind) {
  const c = copy[kind];
  return `<!doctype html><html><body style="margin:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1.5px solid #111;border-radius:16px">
<tr><td style="padding:28px 28px 0"><span style="display:inline-block;background:#ffe11a;border:1.5px solid #111;border-radius:999px;padding:4px 12px;font-weight:700;font-size:14px">Suinance</span></td></tr>
<tr><td style="padding:20px 28px 0"><h1 style="margin:0;font-size:24px">${c.heading}</h1>
<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#444">Hi ${escapeHtml(name)}, ${c.body}</p></td></tr>
<tr><td style="padding:24px 28px"><div style="background:#fff6b3;border:1.5px solid #111;border-radius:12px;padding:18px;text-align:center;font-family:'Courier New',monospace;font-size:34px;letter-spacing:10px;font-weight:700">${code}</div>
<p style="margin:14px 0 0;font-size:13px;color:#666">This code expires in 10 minutes. Never share it with anyone. Suinance will never ask for it.</p></td></tr>
</table><p style="font-size:12px;color:#888;margin-top:16px">Suinance is independent and not affiliated with Mysten Labs or the Sui Foundation.</p>
</td></tr></table></body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

export async function sendOtpEmail(to: string, name: string, code: string, kind: Kind) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is not set.");
    console.info(`\n[dev email] ${copy[kind].subject} → ${to}\n[dev email] code: ${code}\n`);
    return;
  }
  const from = process.env.EMAIL_FROM ?? "Suinance <onboarding@resend.dev>";
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: copy[kind].subject,
    html: html(name, code, kind),
    text: `${copy[kind].heading}\n\nYour code: ${code}\n\nIt expires in 10 minutes.`,
  });
  if (error) throw new Error(`Email failed: ${error.message}`);
}
