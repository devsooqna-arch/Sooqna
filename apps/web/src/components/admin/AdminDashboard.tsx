"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  createAdminCategory,
  getAdminAuditLogs,
  getAdminCategories,
  getAdminListings,
  getAdminReports,
  getAdminStats,
  getAdminUsers,
  runAdminListingAction,
  updateAdminCategory,
  updateAdminReport,
  updateAdminUser,
} from "@/services/adminService";
import type {
  AdminAccountStatus,
  AdminAuditLog,
  AdminCategory,
  AdminListResponse,
  AdminListing,
  AdminReport,
  AdminReportStatus,
  AdminRole,
  AdminStats,
  AdminUser,
} from "@/types/admin";
import type { ListingStatus } from "@/types/listing";

type Tab = "overview" | "listings" | "users" | "reports" | "categories" | "audit";
type LoadState = "idle" | "loading" | "ready" | "error";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "نظرة عامة" },
  { id: "listings", label: "الإعلانات" },
  { id: "users", label: "المستخدمون" },
  { id: "reports", label: "البلاغات" },
  { id: "categories", label: "التصنيفات" },
  { id: "audit", label: "سجل التدقيق" },
];

const LISTING_STATUSES: Array<ListingStatus | ""> = ["", "draft", "pending", "published", "rejected", "sold", "archived"];
const USER_ROLES: Array<AdminRole | ""> = ["", "ADMIN", "BUYER", "SELLER"];
const ACCOUNT_STATUSES: Array<AdminAccountStatus | ""> = ["", "active", "suspended", "deleted"];
const REPORT_STATUSES: Array<AdminReportStatus | ""> = ["", "open", "in_review", "resolved", "rejected"];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="space-y-5" dir="rtl">
      <header className="border-b border-[var(--border)] pb-4">
        <p className="text-xs font-semibold text-[var(--brand)]">Admin Dashboard V1</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[var(--text)]">لوحة إدارة سوقنا</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">إدارة عملية للإعلانات والمستخدمين والبلاغات بدون الوصول اليدوي لقاعدة البيانات.</p>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-[var(--border)] pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-semibold ${
              tab === item.id
                ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-contrast)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? <OverviewPanel /> : null}
      {tab === "listings" ? <ListingsPanel /> : null}
      {tab === "users" ? <UsersPanel /> : null}
      {tab === "reports" ? <ReportsPanel /> : null}
      {tab === "categories" ? <CategoriesPanel /> : null}
      {tab === "audit" ? <AuditPanel /> : null}
    </div>
  );
}

function OverviewPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminStats()
      .then((result) => {
        setStats(result);
        setState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "تعذر تحميل الإحصاءات.");
        setState("error");
      });
  }, []);

  useEffect(load, [load]);

  if (state !== "ready") return <StateBox state={state} error={error} empty="لا توجد إحصاءات بعد." />;
  if (!stats) return <StateBox state="idle" empty="لا توجد إحصاءات بعد." />;

  const cards = [
    ["إجمالي المستخدمين", stats.users.total],
    ["المستخدمون النشطون", stats.users.active],
    ["المستخدمون الموقوفون", stats.users.suspended],
    ["إجمالي الإعلانات", stats.listings.total],
    ["المنشورة", stats.listings.published],
    ["المسودات", stats.listings.draft],
    ["المباعة", stats.listings.sold],
    ["المؤرشفة/المرفوضة", stats.listings.archivedOrRejected],
    ["بلاغات مفتوحة", stats.reports.open],
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--text)]">{value}</p>
          </div>
        ))}
      </div>
      <DataSection title="آخر إجراءات التدقيق">
        {stats.recentAuditActions.length ? (
          <SimpleTable
            headers={["الإجراء", "المنفذ", "الهدف", "الوقت"]}
            rows={stats.recentAuditActions.map((log) => [log.action, log.actorId ?? "-", `${log.targetType}:${log.targetId ?? "-"}`, formatDate(log.createdAt)])}
          />
        ) : (
          <EmptyState message="لا توجد إجراءات حديثة." />
        )}
      </DataSection>
    </section>
  );
}

function ListingsPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [result, setResult] = useState<AdminListResponse<AdminListing> | null>(null);
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminListings({ limit: 25, status, search })
      .then((data) => {
        setResult(data);
        setState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "تعذر تحميل الإعلانات.");
        setState("error");
      });
  }, [status, search]);

  useEffect(load, [load]);

  async function action(id: string, next: "publish" | "reject" | "archive" | "sold" | "feature" | "unfeature") {
    const reason = next === "reject" || next === "archive" ? window.prompt("سبب الإجراء اختياري:") ?? undefined : undefined;
    if ((next === "reject" || next === "archive" || next === "sold") && !window.confirm("هل تريد تنفيذ هذا الإجراء؟")) return;
    setBusy(`${id}:${next}`);
    try {
      await runAdminListingAction(id, next, reason);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تنفيذ الإجراء.");
      setState("error");
    } finally {
      setBusy("");
    }
  }

  return (
    <DataSection title="إدارة الإعلانات">
      <Filters>
        <select value={status} onChange={(e) => setStatus(e.target.value as ListingStatus | "")} className="admin-input">
          {LISTING_STATUSES.map((item) => <option key={item || "all"} value={item}>{item || "كل الحالات"}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالعنوان أو id" className="admin-input" />
        <button onClick={load} className="admin-button">تحديث</button>
      </Filters>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا توجد إعلانات." /> : result?.data.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b text-[var(--text-muted)]"><Th>العنوان</Th><Th>المالك</Th><Th>الحالة</Th><Th>المدينة</Th><Th>التصنيف</Th><Th>مميز</Th><Th>تاريخ الإنشاء</Th><Th>إجراءات</Th></tr></thead>
            <tbody>
              {result.data.map((listing) => (
                <tr key={listing.id} className="border-b border-[var(--border)]">
                  <Td>{listing.title}</Td><Td>{listing.ownerSnapshotName || listing.ownerId || "-"}</Td><Td>{listing.status}</Td><Td>{listing.locationCity}</Td><Td>{listing.categoryId}</Td><Td>{listing.isFeatured ? "نعم" : "لا"}</Td><Td>{formatDate(listing.createdAt)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {(["publish", "reject", "archive", "sold", listing.isFeatured ? "unfeature" : "feature"] as const).map((item) => (
                        <button key={item} disabled={busy === `${listing.id}:${item}`} onClick={() => void action(listing.id, item)} className="admin-action">{actionLabel(item)}</button>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState message="لا توجد إعلانات مطابقة." />}
    </DataSection>
  );
}

function UsersPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [result, setResult] = useState<AdminListResponse<AdminUser> | null>(null);
  const [role, setRole] = useState<AdminRole | "">("");
  const [status, setStatus] = useState<AdminAccountStatus | "">("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminUsers({ limit: 25, role, status, search })
      .then((data) => { setResult(data); setState("ready"); })
      .catch((err) => { setError(err instanceof Error ? err.message : "تعذر تحميل المستخدمين."); setState("error"); });
  }, [role, status, search]);

  useEffect(load, [load]);

  async function patchUser(user: AdminUser, patch: { role?: AdminRole; accountStatus?: AdminAccountStatus }) {
    if (!window.confirm("تأكيد تعديل المستخدم؟")) return;
    try {
      await updateAdminUser(user.firebaseUid, patch);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تعديل المستخدم.");
      setState("error");
    }
  }

  return (
    <DataSection title="إدارة المستخدمين">
      <Filters>
        <select value={role} onChange={(e) => setRole(e.target.value as AdminRole | "")} className="admin-input">{USER_ROLES.map((item) => <option key={item || "all"} value={item}>{item || "كل الأدوار"}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value as AdminAccountStatus | "")} className="admin-input">{ACCOUNT_STATUSES.map((item) => <option key={item || "all"} value={item}>{item || "كل الحالات"}</option>)}</select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد" className="admin-input" />
        <button onClick={load} className="admin-button">تحديث</button>
      </Filters>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا يوجد مستخدمون." /> : result?.data.length ? (
        <SimpleTable
          headers={["الاسم", "البريد", "الدور", "الحالة", "موثق", "الإعلانات", "تاريخ الإنشاء", "إجراءات"]}
          rows={result.data.map((user) => [
            user.name,
            user.email,
            user.role,
            user.accountStatus,
            user.isEmailVerified ? "نعم" : "لا",
            String(user.totalListings ?? 0),
            formatDate(user.createdAt),
            <div key={user.firebaseUid} className="flex flex-wrap gap-1">
              <button onClick={() => void patchUser(user, { accountStatus: user.accountStatus === "active" ? "suspended" : "active" })} className="admin-action">{user.accountStatus === "active" ? "إيقاف" : "تفعيل"}</button>
              <button onClick={() => void patchUser(user, { role: user.role === "ADMIN" ? "BUYER" : "ADMIN" })} className="admin-action">{user.role === "ADMIN" ? "إزالة إدارة" : "ترقية ADMIN"}</button>
            </div>,
          ])}
        />
      ) : <EmptyState message="لا يوجد مستخدمون مطابقون." />}
    </DataSection>
  );
}

function ReportsPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [result, setResult] = useState<AdminListResponse<AdminReport> | null>(null);
  const [status, setStatus] = useState<AdminReportStatus | "">("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminReports({ limit: 25, status })
      .then((data) => { setResult(data); setState("ready"); })
      .catch((err) => { setError(err instanceof Error ? err.message : "تعذر تحميل البلاغات."); setState("error"); });
  }, [status]);

  useEffect(load, [load]);

  async function update(report: AdminReport, next: AdminReportStatus) {
    const note = window.prompt("ملاحظة المشرف اختيارية:") ?? undefined;
    try {
      await updateAdminReport(report.id, next, note);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تعديل البلاغ.");
      setState("error");
    }
  }

  return (
    <DataSection title="طابور البلاغات">
      <Filters>
        <select value={status} onChange={(e) => setStatus(e.target.value as AdminReportStatus | "")} className="admin-input">{REPORT_STATUSES.map((item) => <option key={item || "all"} value={item}>{item || "كل الحالات"}</option>)}</select>
        <button onClick={load} className="admin-button">تحديث</button>
      </Filters>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا توجد بلاغات." /> : result?.data.length ? (
        <SimpleTable
          headers={["السبب", "الهدف", "المبلّغ", "الحالة", "التاريخ", "إجراءات"]}
          rows={result.data.map((report) => [
            report.reasonCode,
            `${report.targetType}:${report.targetId}`,
            report.reporterId,
            report.status,
            formatDate(report.createdAt),
            <div key={report.id} className="flex flex-wrap gap-1">{(["in_review", "resolved", "rejected"] as const).map((item) => <button key={item} onClick={() => void update(report, item)} className="admin-action">{item}</button>)}</div>,
          ])}
        />
      ) : <EmptyState message="لا توجد بلاغات مطابقة." />}
    </DataSection>
  );
}

function CategoriesPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ id: "", slug: "", nameAr: "", nameEn: "", sortOrder: "0" });

  const load = useCallback(() => {
    setState("loading");
    void getAdminCategories()
      .then((data) => { setItems(data); setState("ready"); })
      .catch((err) => { setError(err instanceof Error ? err.message : "تعذر تحميل التصنيفات."); setState("error"); });
  }, []);

  useEffect(load, [load]);

  async function create() {
    try {
      await createAdminCategory({ ...form, sortOrder: Number(form.sortOrder) || 0 });
      setForm({ id: "", slug: "", nameAr: "", nameEn: "", sortOrder: "0" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء التصنيف.");
      setState("error");
    }
  }

  return (
    <DataSection title="إدارة التصنيفات">
      <Filters>
        {(["id", "slug", "nameAr", "nameEn", "sortOrder"] as const).map((key) => (
          <input key={key} value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={key} className="admin-input" />
        ))}
        <button onClick={() => void create()} className="admin-button">إضافة</button>
      </Filters>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا توجد تصنيفات." /> : items.length ? (
        <SimpleTable
          headers={["الاسم", "slug", "الترتيب", "نشط", "إجراءات"]}
          rows={items.map((category) => [
            `${category.name?.ar ?? category.nameAr} / ${category.name?.en ?? category.nameEn}`,
            category.slug,
            String(category.sortOrder),
            category.isActive ? "نعم" : "لا",
            <button key={category.id} onClick={() => void updateAdminCategory(category.id, { isActive: !category.isActive }).then(load)} className="admin-action">{category.isActive ? "تعطيل" : "تفعيل"}</button>,
          ])}
        />
      ) : <EmptyState message="لا توجد تصنيفات." />}
    </DataSection>
  );
}

function AuditPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [result, setResult] = useState<AdminListResponse<AdminAuditLog> | null>(null);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminAuditLogs({ limit: 50, action, targetType })
      .then((data) => { setResult(data); setState("ready"); })
      .catch((err) => { setError(err instanceof Error ? err.message : "تعذر تحميل سجل التدقيق."); setState("error"); });
  }, [action, targetType]);

  useEffect(load, [load]);

  return (
    <DataSection title="سجل التدقيق">
      <Filters>
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="الإجراء" className="admin-input" />
        <input value={targetType} onChange={(e) => setTargetType(e.target.value)} placeholder="نوع الهدف" className="admin-input" />
        <button onClick={load} className="admin-button">تحديث</button>
      </Filters>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا توجد سجلات." /> : result?.data.length ? (
        <SimpleTable
          headers={["المنفذ", "الإجراء", "الهدف", "metadata", "الوقت"]}
          rows={result.data.map((log) => [log.actorId ?? "-", log.action, `${log.targetType}:${log.targetId ?? "-"}`, JSON.stringify(log.metadata), formatDate(log.createdAt)])}
        />
      ) : <EmptyState message="لا توجد سجلات مطابقة." />}
    </DataSection>
  );
}

function DataSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>{children}</section>;
}

function Filters({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 [&_.admin-button]:rounded-md [&_.admin-button]:bg-[var(--brand)] [&_.admin-button]:px-3 [&_.admin-button]:py-2 [&_.admin-button]:text-sm [&_.admin-button]:font-semibold [&_.admin-button]:text-[var(--brand-contrast)] [&_.admin-input]:rounded-md [&_.admin-input]:border [&_.admin-input]:border-[var(--border)] [&_.admin-input]:bg-white [&_.admin-input]:px-3 [&_.admin-input]:py-2 [&_.admin-input]:text-sm">{children}</div>;
}

function StateBox({ state, error, empty }: { state: LoadState; error?: string; empty: string }) {
  if (state === "loading") return <p className="rounded-md border border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">جاري التحميل...</p>;
  if (state === "error") return <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error || "حدث خطأ."}</p>;
  return <EmptyState message={empty} />;
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">{message}</p>;
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="border-b border-[var(--border)] text-[var(--text-muted)]">{headers.map((header) => <Th key={header}>{header}</Th>)}</tr></thead>
        <tbody>{rows.map((row, idx) => <tr key={idx} className="border-b border-[var(--border)]">{row.map((cell, cellIdx) => <Td key={cellIdx}>{cell}</Td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-3 py-2 text-start text-xs font-semibold">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-64 px-3 py-2 align-top text-[var(--text)]">{children}</td>;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function actionLabel(action: string) {
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
