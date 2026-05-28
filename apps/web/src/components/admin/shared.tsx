"use client";

import type { ReactNode } from "react";
import type { AdminHealth } from "@/types/admin";

export type LoadState = "idle" | "loading" | "ready" | "error";

export function MetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-[var(--text)]">{value}</p>
    </div>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
      {active ? "نشطة" : "غير نشطة"}
    </span>
  );
}

export function HealthCard({ title, status, message }: { title: string; status: AdminHealth["api"]["status"]; message: string }) {
  const styles: Record<AdminHealth["api"]["status"], string> = {
    healthy: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
    not_configured: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return (
    <div className={`rounded-lg border p-4 ${styles[status]}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold">{title}</h3>
        <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">{healthLabel(status)}</span>
      </div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}

export function DataSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>{children}</section>;
}

export function Filters({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 [&_.admin-button]:rounded-md [&_.admin-button]:bg-[var(--brand)] [&_.admin-button]:px-3 [&_.admin-button]:py-2 [&_.admin-button]:text-sm [&_.admin-button]:font-semibold [&_.admin-button]:text-[var(--brand-contrast)] [&_.admin-input]:rounded-md [&_.admin-input]:border [&_.admin-input]:border-[var(--border)] [&_.admin-input]:bg-white [&_.admin-input]:px-3 [&_.admin-input]:py-2 [&_.admin-input]:text-sm">{children}</div>;
}

export function StateBox({ state, error, empty }: { state: LoadState; error?: string; empty: string }) {
  if (state === "loading") return <p className="rounded-md border border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">جاري التحميل...</p>;
  if (state === "error") return <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error || "حدث خطأ."}</p>;
  return <EmptyState message={empty} />;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">{message}</p>;
}

export function SimpleTable({ headers, rows }: { headers: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="border-b border-[var(--border)] text-[var(--text-muted)]">{headers.map((header) => <Th key={header}>{header}</Th>)}</tr></thead>
        <tbody>{rows.map((row, idx) => <tr key={idx} className="border-b border-[var(--border)]">{row.map((cell, cellIdx) => <Td key={cellIdx}>{cell}</Td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="px-3 py-2 text-start text-xs font-semibold">{children}</th>;
}

export function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-64 px-3 py-2 align-top text-[var(--text)]">{children}</td>;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "مسودة",
    pending: "بانتظار المراجعة",
    published: "منشور",
    rejected: "مرفوض",
    sold: "مباع",
    archived: "مؤرشف",
  };
  return labels[status] ?? status;
}

export function actionLabel(action: string) {
  const labels: Record<string, string> = {
    publish: "نشر",
    reject: "رفض",
    archive: "أرشفة",
    sold: "بيع",
    feature: "تمييز",
    unfeature: "إلغاء التمييز",
  };
  return labels[action] ?? action;
}

function healthLabel(status: string) {
  const labels: Record<string, string> = {
    healthy: "سليم",
    warning: "تحذير",
    error: "خطأ",
    not_configured: "غير مفعّل",
  };
  return labels[status] ?? status;
}
