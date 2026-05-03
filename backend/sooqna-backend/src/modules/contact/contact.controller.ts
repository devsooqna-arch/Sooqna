import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(10_000),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * POST /api/contact — يرسل نموذج «اتصل بنا» عبر Resend (إن وُجدت RESEND_API_KEY).
 */
export async function postContact(req: Request, res: Response): Promise<void> {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "بيانات غير صالحة." });
    return;
  }

  const { name, email, message } = parsed.data;
  const subjectLine = parsed.data.subject?.trim() || "رسالة من نموذج اتصل بنا — سوقنا";

  const html = `
    <p><strong>الاسم:</strong> ${escapeHtml(name)}</p>
    <p><strong>البريد:</strong> ${escapeHtml(email)}</p>
    <p><strong>الموضوع:</strong> ${escapeHtml(subjectLine)}</p>
    <hr />
    <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
  `;

  const key = env.resendApiKey;
  if (!key) {
    if (env.nodeEnv === "development") {
      logger.info("contact form (dev, no RESEND_API_KEY)", { name, email, subject: subjectLine });
      res.json({ success: true, dev: true });
      return;
    }
    res.status(503).json({ success: false, error: "خدمة البريد غير مهيأة على الخادم." });
    return;
  }

  try {
    const upstream = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.contactFromEmail,
        to: [env.contactToEmail],
        reply_to: email,
        subject: `[سوقنا] ${subjectLine}`,
        html,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      logger.error("Resend contact failed", { status: upstream.status, errText });
      res.status(502).json({ success: false, error: "تعذّر إرسال الرسالة." });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    logger.error("contact upstream error", { err: String(err) });
    res.status(502).json({ success: false, error: "تعذّر الاتصال بخدمة البريد." });
  }
}
