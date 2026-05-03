import { NextResponse } from "next/server";

const DEFAULT_API = "http://localhost:5000/api";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? DEFAULT_API;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

/**
 * يمرّر الطلب إلى الـ backend (POST /api/contact) حيث يُرسَل البريد عبر Resend.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح." }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiBase()}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      dev?: boolean;
      error?: string;
    };

    const ok = Boolean(res.ok && json.success === true);
    return NextResponse.json(
      { ok, dev: json.dev, error: json.error },
      { status: res.ok ? 200 : res.status }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "تعذّر الاتصال بالخادم." },
      { status: 502 }
    );
  }
}
