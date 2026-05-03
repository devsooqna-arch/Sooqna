import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

/**
 * POST /api/contact — forwards to Resend when RESEND_API_KEY is set.
 * Env: RESEND_API_KEY, CONTACT_TO_EMAIL (default info@sooqna.com), CONTACT_FROM_EMAIL (verified sender in Resend).
 */
export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const subject = body.subject?.trim() || "رسالة من نموذج اتصل بنا — سوقنا";
  const message = body.message?.trim();

  if (!isNonEmpty(name) || !isNonEmpty(email) || !isNonEmpty(message)) {
    return NextResponse.json({ ok: false, error: "الاسم والبريد والرسالة مطلوبة." }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL || "info@sooqna.com";
  const from = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
  const key = process.env.RESEND_API_KEY;

  const html = `
    <p><strong>الاسم:</strong> ${escapeHtml(name)}</p>
    <p><strong>البريد:</strong> ${escapeHtml(email)}</p>
    <p><strong>الموضوع:</strong> ${escapeHtml(subject)}</p>
    <hr />
    <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
  `;

  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] (dev, no RESEND_API_KEY)", { name, email, subject, message });
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json(
      { ok: false, error: "خدمة البريد غير مهيأة حالياً." },
      { status: 503 }
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `[سوقنا] ${subject}`,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[contact] Resend error", res.status, errText);
    return NextResponse.json({ ok: false, error: "تعذّر إرسال الرسالة." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
