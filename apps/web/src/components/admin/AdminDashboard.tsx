"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  createAdminCategory,
  createAdminCity,
  getAdminAnalytics,
  getAdminAuditLogs,
  getAdminCategories,
  getAdminCities,
  getAdminHealth,
  getAdminListingModerationHistory,
  getAdminListings,
  getAdminReports,
  getAdminStats,
  getAdminUserDetails,
  getAdminUsers,
  runAdminBulkListingAction,
  runAdminListingAction,
  updateAdminCategory,
  updateAdminCity,
  updateAdminReport,
  updateAdminUser,
} from "@/services/adminService";
import type {
  AdminAccountStatus,
  AdminAnalytics,
  AdminAuditLog,
  AdminCategory,
  AdminCity,
  AdminHealth,
  AdminListResponse,
  AdminListing,
  AdminModerationLog,
  AdminReport,
  AdminReportStatus,
  AdminRole,
  AdminStats,
  AdminUser,
  AdminUserDetails,
} from "@/types/admin";
import type { ListingStatus } from "@/types/listing";

type Tab = "overview" | "analytics" | "moderation" | "listings" | "users" | "reports" | "categories" | "cities" | "health" | "audit";
type LoadState = "idle" | "loading" | "ready" | "error";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "نظرة عامة" },
  { id: "analytics", label: "التحليلات" },
  { id: "moderation", label: "المراجعة" },
  { id: "listings", label: "الإعلانات" },
  { id: "users", label: "المستخدمون" },
  { id: "reports", label: "البلاغات" },
  { id: "categories", label: "التصنيفات" },
  { id: "cities", label: "المدن" },
  { id: "health", label: "صحة النظام" },
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
      {tab === "analytics" ? <AnalyticsPanel /> : null}
      {tab === "moderation" ? <ModerationPanel /> : null}
      {tab === "listings" ? <ListingsPanel /> : null}
      {tab === "users" ? <UsersPanel /> : null}
      {tab === "reports" ? <ReportsPanel /> : null}
      {tab === "categories" ? <CategoriesPanel /> : null}
      {tab === "cities" ? <CitiesPanel /> : null}
      {tab === "health" ? <SystemHealthPanel /> : null}
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
      {stats.topCities.length ? (
        <DataSection title="أكثر المدن نشاطاً">
          <div className="space-y-2">
            {stats.topCities.map((item) => {
              const max = Math.max(...stats.topCities.map((city) => city.listingCount), 1);
              return (
                <div key={item.city} className="grid grid-cols-[120px_1fr_40px] items-center gap-3 text-sm">
                  <span className="text-[var(--text)]">{item.city}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <span
                      className="block h-full rounded-full bg-[var(--brand)]"
                      style={{ width: `${Math.max(8, (item.listingCount / max) * 100)}%` }}
                    />
                  </span>
                  <span className="text-end font-bold">{item.listingCount}</span>
                </div>
              );
            })}
          </div>
        </DataSection>
      ) : null}
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

function AnalyticsPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminAnalytics()
      .then((data) => {
        setAnalytics(data);
        setState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "تعذر تحميل التحليلات.");
        setState("error");
      });
  }, []);

  useEffect(load, [load]);

  if (state !== "ready") return <StateBox state={state} error={error} empty="لا توجد بيانات تحليلية بعد." />;
  if (!analytics) return <StateBox state="idle" empty="لا توجد بيانات تحليلية بعد." />;

  const kpis = [
    ["إعلانات اليوم", analytics.kpis.newListingsToday],
    ["إعلانات آخر 7 أيام", analytics.kpis.newListingsThisWeek],
    ["مستخدمون اليوم", analytics.kpis.newUsersToday],
    ["مستخدمون آخر 7 أيام", analytics.kpis.newUsersThisWeek],
    ["إجمالي الإعلانات", analytics.kpis.totalListings],
    ["نسبة النشر", `${analytics.kpis.conversionRate}%`],
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(([label, value]) => (
          <MetricCard key={label} label={String(label)} value={value} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataSection title="النمو خلال آخر 14 يوم">
          <LineChart
            points={analytics.growth.daily.map((item) => ({ label: item.date.slice(5), value: item.listings }))}
            secondaryPoints={analytics.growth.daily.map((item) => ({ label: item.date.slice(5), value: item.users }))}
          />
          <div className="mt-3 flex gap-4 text-xs text-[var(--text-muted)]">
            <span><span className="inline-block h-2 w-2 rounded-full bg-[var(--brand)]" /> الإعلانات</span>
            <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-600" /> المستخدمون</span>
          </div>
        </DataSection>
        <DataSection title="حالات الإعلانات">
          <DonutChart items={analytics.listingStatuses.map((item) => ({ label: statusLabel(item.status), value: item.count }))} />
        </DataSection>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataSection title="أكثر المدن نشاطاً">
          <BarChart items={analytics.topCities.map((item) => ({ label: item.city, value: item.listingCount }))} />
        </DataSection>
        <DataSection title="أكثر التصنيفات نشاطاً">
          <BarChart items={analytics.topCategories.map((item) => ({ label: item.nameAr, value: item.listingCount }))} />
        </DataSection>
      </div>
      <DataSection title="آخر النشاطات">
        {analytics.latestActivities.length ? (
          <SimpleTable
            headers={["الإجراء", "المنفذ", "الهدف", "الوقت"]}
            rows={analytics.latestActivities.map((log) => [log.action, log.actorId ?? "-", `${log.targetType}:${log.targetId ?? "-"}`, formatDate(log.createdAt)])}
          />
        ) : (
          <EmptyState message="لا توجد نشاطات حديثة." />
        )}
      </DataSection>
    </section>
  );
}

function ModerationPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [result, setResult] = useState<AdminListResponse<AdminListing> | null>(null);
  const [status, setStatus] = useState<ListingStatus | "">("pending");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [history, setHistory] = useState<AdminModerationLog[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    setSelected([]);
    void getAdminListings({ limit: 50, status, city, category, dateFrom })
      .then((data) => {
        setResult(data);
        setState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "تعذر تحميل طابور المراجعة.");
        setState("error");
      });
  }, [status, city, category, dateFrom]);

  useEffect(load, [load]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function singleAction(id: string, action: "publish" | "reject" | "archive") {
    const reason = action === "reject" ? window.prompt("سبب الرفض مطلوب:") ?? "" : undefined;
    if (action === "reject" && !reason.trim()) return;
    try {
      await runAdminListingAction(id, action, reason);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تنفيذ الإجراء.");
      setState("error");
    }
  }

  async function bulk(action: "publish" | "reject" | "archive") {
    if (!selected.length) return;
    const reason = action === "reject" ? window.prompt("سبب الرفض مطلوب لكل العناصر المحددة:") ?? "" : undefined;
    if (action === "reject" && !reason.trim()) return;
    try {
      await runAdminBulkListingAction({ ids: selected, action, reason });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تنفيذ الإجراء الجماعي.");
      setState("error");
    }
  }

  async function showHistory(id: string) {
    try {
      setHistory(await getAdminListingModerationHistory(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل سجل المراجعة.");
      setState("error");
    }
  }

  return (
    <DataSection title="مراجعة الإعلانات">
      <Filters>
        <select value={status} onChange={(e) => setStatus(e.target.value as ListingStatus | "")} className="admin-input">
          {LISTING_STATUSES.map((item) => <option key={item || "all"} value={item}>{item ? statusLabel(item) : "كل الحالات"}</option>)}
        </select>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" className="admin-input" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="التصنيف" className="admin-input" />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="admin-input" />
        <button onClick={load} className="admin-button">تحديث</button>
      </Filters>
      <div className="flex flex-wrap gap-2">
        {(["publish", "reject", "archive"] as const).map((item) => (
          <button key={item} disabled={!selected.length} onClick={() => void bulk(item)} className="admin-action disabled:opacity-40">
            {actionLabel(item)} المحدد ({selected.length})
          </button>
        ))}
      </div>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا توجد إعلانات للمراجعة." /> : result?.data.length ? (
        <SimpleTable
          headers={["اختيار", "العنوان", "الحالة", "المدينة", "التصنيف", "التاريخ", "إجراءات"]}
          rows={result.data.map((listing) => [
            <input key={listing.id} type="checkbox" checked={selected.includes(listing.id)} onChange={() => toggle(listing.id)} />,
            listing.title,
            statusLabel(listing.status),
            listing.locationCity,
            listing.categoryId,
            formatDate(listing.createdAt),
            <div key={listing.id} className="flex flex-wrap gap-1">
              {(["publish", "reject", "archive"] as const).map((item) => <button key={item} onClick={() => void singleAction(listing.id, item)} className="admin-action">{actionLabel(item)}</button>)}
              <button onClick={() => void showHistory(listing.id)} className="admin-action">السجل</button>
            </div>,
          ])}
        />
      ) : <EmptyState message="لا توجد إعلانات مطابقة." />}
      {history.length ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-bold text-[var(--text)]">آخر سجل مراجعة</h3>
          <SimpleTable
            headers={["المشرف", "الإجراء", "من", "إلى", "السبب", "الوقت"]}
            rows={history.map((log) => [log.adminUserId, actionLabel(log.action), log.previousStatus ?? "-", log.newStatus ?? "-", log.reason ?? "-", formatDate(log.createdAt)])}
          />
        </div>
      ) : null}
    </DataSection>
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
  const [dateFrom, setDateFrom] = useState("");
  const [details, setDetails] = useState<AdminUserDetails | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminUsers({ limit: 25, role, status, search, dateFrom })
      .then((data) => { setResult(data); setState("ready"); })
      .catch((err) => { setError(err instanceof Error ? err.message : "تعذر تحميل المستخدمين."); setState("error"); });
  }, [role, status, search, dateFrom]);

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

  async function openDetails(user: AdminUser) {
    try {
      setDetails(await getAdminUserDetails(user.firebaseUid));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل تفاصيل المستخدم.");
      setState("error");
    }
  }

  return (
    <DataSection title="إدارة المستخدمين">
      <Filters>
        <select value={role} onChange={(e) => setRole(e.target.value as AdminRole | "")} className="admin-input">{USER_ROLES.map((item) => <option key={item || "all"} value={item}>{item || "كل الأدوار"}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value as AdminAccountStatus | "")} className="admin-input">{ACCOUNT_STATUSES.map((item) => <option key={item || "all"} value={item}>{item || "كل الحالات"}</option>)}</select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد" className="admin-input" />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="admin-input" />
        <button onClick={load} className="admin-button">تحديث</button>
      </Filters>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا يوجد مستخدمون." /> : result?.data.length ? (
        <SimpleTable
          headers={["الاسم", "البريد", "الدور", "الحالة", "موثق", "الإعلانات", "آخر دخول", "تاريخ الإنشاء", "إجراءات"]}
          rows={result.data.map((user) => [
            user.name,
            user.email,
            user.role,
            user.accountStatus,
            user.isEmailVerified ? "نعم" : "لا",
            String(user.listingCount ?? user.totalListings ?? 0),
            formatDate(user.lastLoginAt),
            formatDate(user.createdAt),
            <div key={user.firebaseUid} className="flex flex-wrap gap-1">
              <button onClick={() => void patchUser(user, { accountStatus: user.accountStatus === "active" ? "suspended" : "active" })} className="admin-action">{user.accountStatus === "active" ? "إيقاف" : "تفعيل"}</button>
              <button onClick={() => void patchUser(user, { role: user.role === "ADMIN" ? "BUYER" : "ADMIN" })} className="admin-action">{user.role === "ADMIN" ? "إزالة إدارة" : "ترقية ADMIN"}</button>
              <button onClick={() => void openDetails(user)} className="admin-action">تفاصيل</button>
            </div>,
          ])}
        />
      ) : <EmptyState message="لا يوجد مستخدمون مطابقون." />}
      {details ? (
        <div className="mt-4 space-y-3 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">{details.user.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{details.user.email}</p>
            </div>
            <button className="admin-action" onClick={() => setDetails(null)}>إغلاق</button>
          </div>
          <SimpleTable
            headers={["الدور", "الحالة", "الإعلانات", "مباع", "آخر دخول", "تاريخ الإنشاء"]}
            rows={[[details.user.role, details.user.accountStatus, String(details.user.listingCount ?? 0), String(details.user.totalSold ?? 0), formatDate(details.user.lastLoginAt), formatDate(details.user.createdAt)]]}
          />
          <SimpleTable
            headers={["آخر الإعلانات", "الحالة", "المدينة", "التاريخ"]}
            rows={details.recentListings.map((listing) => [listing.title, statusLabel(listing.status), listing.locationCity, formatDate(listing.createdAt)])}
          />
        </div>
      ) : null}
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

function CitiesPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [items, setItems] = useState<AdminCity[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ id: "", slug: "", nameAr: "", nameEn: "", sortOrder: "0" });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminCity | null>(null);

  const load = useCallback(() => {
    setState("loading");
    void getAdminCities()
      .then((data) => { setItems(data); setState("ready"); })
      .catch((err) => { setError(err instanceof Error ? err.message : "تعذر تحميل المدن."); setState("error"); });
  }, []);

  useEffect(load, [load]);

  async function create() {
    try {
      await createAdminCity({ ...form, sortOrder: Number(form.sortOrder) || 0 });
      setForm({ id: "", slug: "", nameAr: "", nameEn: "", sortOrder: "0" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء المدينة.");
      setState("error");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await updateAdminCity(editing.id, {
        nameAr: editing.nameAr,
        nameEn: editing.nameEn,
        slug: editing.slug,
        sortOrder: editing.sortOrder,
        isActive: editing.isActive,
      });
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تعديل المدينة.");
      setState("error");
    }
  }

  const visibleItems = items.filter((city) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [city.nameAr, city.nameEn, city.slug, city.id].some((value) => value.toLowerCase().includes(term));
  });

  return (
    <DataSection title="إدارة المدن">
      <Filters>
        {(["id", "slug", "nameAr", "nameEn", "sortOrder"] as const).map((key) => (
          <input key={key} value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={key} className="admin-input" />
        ))}
        <button onClick={() => void create()} className="admin-button">إضافة</button>
      </Filters>
      <Filters>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المدن" className="admin-input" />
      </Filters>
      {state !== "ready" ? <StateBox state={state} error={error} empty="لا توجد مدن." /> : visibleItems.length ? (
        <SimpleTable
          headers={["المدينة", "slug", "الترتيب", "الإعلانات", "نشطة", "إجراءات"]}
          rows={visibleItems.map((city) => [
            editing?.id === city.id ? (
              <div key={`${city.id}-names`} className="grid gap-1">
                <input value={editing.nameAr} onChange={(e) => setEditing((prev) => prev ? { ...prev, nameAr: e.target.value } : prev)} className="admin-input" />
                <input value={editing.nameEn} onChange={(e) => setEditing((prev) => prev ? { ...prev, nameEn: e.target.value } : prev)} className="admin-input" />
              </div>
            ) : `${city.nameAr} / ${city.nameEn}`,
            editing?.id === city.id ? <input key={`${city.id}-slug`} value={editing.slug} onChange={(e) => setEditing((prev) => prev ? { ...prev, slug: e.target.value } : prev)} className="admin-input" /> : city.slug,
            editing?.id === city.id ? <input key={`${city.id}-order`} type="number" value={editing.sortOrder} onChange={(e) => setEditing((prev) => prev ? { ...prev, sortOrder: Number(e.target.value) || 0 } : prev)} className="admin-input w-24" /> : String(city.sortOrder),
            String(city.listingCount ?? 0),
            <StatusBadge key={`${city.id}-status`} active={editing?.id === city.id ? editing.isActive : city.isActive} />,
            editing?.id === city.id ? (
              <div key={city.id} className="flex flex-wrap gap-1">
                <button onClick={() => void saveEdit()} className="admin-action">حفظ</button>
                <button onClick={() => setEditing(null)} className="admin-action">إلغاء</button>
                <button onClick={() => setEditing((prev) => prev ? { ...prev, isActive: !prev.isActive } : prev)} className="admin-action">{editing.isActive ? "تعطيل" : "تفعيل"}</button>
              </div>
            ) : (
              <div key={city.id} className="flex flex-wrap gap-1">
                <button onClick={() => setEditing(city)} className="admin-action">تعديل</button>
                <button onClick={() => void updateAdminCity(city.id, { isActive: !city.isActive }).then(load)} className="admin-action">{city.isActive ? "تعطيل" : "تفعيل"}</button>
              </div>
            ),
          ])}
        />
      ) : <EmptyState message="لا توجد مدن." />}
    </DataSection>
  );
}

function SystemHealthPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setState("loading");
    void getAdminHealth()
      .then((data) => {
        setHealth(data);
        setState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "تعذر تحميل صحة النظام.");
        setState("error");
      });
  }, []);

  useEffect(load, [load]);

  if (state !== "ready") return <StateBox state={state} error={error} empty="لا توجد بيانات صحة النظام." />;
  if (!health) return <StateBox state="idle" empty="لا توجد بيانات صحة النظام." />;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <HealthCard title="API" status={health.api.status} message={health.api.message} />
        <HealthCard title="Database" status={health.database.status} message={health.database.message} />
        <HealthCard title="Uploads" status={health.uploads.status} message={health.uploads.message} />
        <HealthCard title="Firebase/Auth" status={health.firebaseAuth.status} message={health.firebaseAuth.message} />
      </div>
      <DataSection title="أرقام قاعدة البيانات">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="المستخدمون" value={health.counts.users} />
          <MetricCard label="الإعلانات" value={health.counts.listings} />
          <MetricCard label="التصنيفات" value={health.counts.categories} />
          <MetricCard label="المدن" value={health.counts.cities} />
          <MetricCard label="الملفات" value={health.counts.uploads} />
        </div>
      </DataSection>
      <DataSection title="الأخطاء الحديثة">
        <HealthCard title="Errors" status={health.recentErrors.status} message={health.recentErrors.message} />
      </DataSection>
    </section>
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

function MetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-[var(--text)]">{value}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
      {active ? "نشطة" : "غير نشطة"}
    </span>
  );
}

function HealthCard({ title, status, message }: { title: string; status: AdminHealth["api"]["status"]; message: string }) {
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

function LineChart({ points, secondaryPoints = [] }: { points: Array<{ label: string; value: number }>; secondaryPoints?: Array<{ label: string; value: number }> }) {
  const width = 640;
  const height = 220;
  const padding = 28;
  const maxValue = Math.max(1, ...points.map((item) => item.value), ...secondaryPoints.map((item) => item.value));
  const toPath = (items: Array<{ value: number }>) =>
    items
      .map((item, idx) => {
        const x = padding + (idx / Math.max(items.length - 1, 1)) * (width - padding * 2);
        const y = height - padding - (item.value / maxValue) * (height - padding * 2);
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-h-[220px] w-full min-w-[520px]" role="img" aria-label="growth chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border)" />
        <path d={toPath(points)} fill="none" stroke="var(--brand)" strokeWidth="3" />
        {secondaryPoints.length ? <path d={toPath(secondaryPoints)} fill="none" stroke="#059669" strokeWidth="3" /> : null}
        {points.map((item, idx) => (
          <text key={item.label} x={padding + (idx / Math.max(points.length - 1, 1)) * (width - padding * 2)} y={height - 6} textAnchor="middle" className="fill-[var(--text-muted)] text-[10px]">
            {idx % 2 === 0 ? item.label : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}

function BarChart({ items }: { items: Array<{ label: string; value: number }> }) {
  if (!items.length) return <EmptyState message="لا توجد بيانات كافية." />;
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 text-sm">
          <span className="truncate text-[var(--text)]">{item.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <span className="block h-full rounded-full bg-[var(--brand)]" style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }} />
          </span>
          <span className="text-end font-bold text-[var(--text)]">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ items }: { items: Array<{ label: string; value: number }> }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (!total) return <EmptyState message="لا توجد بيانات كافية." />;
  const colors = ["#166534", "#84cc16", "#f59e0b", "#dc2626", "#2563eb", "#64748b"];
  let offset = 25;
  const segments = items.map((item, idx) => {
    const dash = (item.value / total) * 100;
    const segment = <circle key={item.label} cx="70" cy="70" r="45" fill="none" stroke={colors[idx % colors.length]} strokeWidth="22" strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={offset} />;
    offset -= dash;
    return segment;
  });
  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">{segments}</svg>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
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

function statusLabel(status: string) {
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

function healthLabel(status: string) {
  const labels: Record<string, string> = {
    healthy: "سليم",
    warning: "تحذير",
    error: "خطأ",
    not_configured: "غير مفعّل",
  };
  return labels[status] ?? status;
}
