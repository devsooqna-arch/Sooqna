"use client";

import { EmptyState } from "./shared";

export function LineChart({ points, secondaryPoints = [] }: { points: Array<{ label: string; value: number }>; secondaryPoints?: Array<{ label: string; value: number }> }) {
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

export function BarChart({ items }: { items: Array<{ label: string; value: number }> }) {
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

export function DonutChart({ items }: { items: Array<{ label: string; value: number }> }) {
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
