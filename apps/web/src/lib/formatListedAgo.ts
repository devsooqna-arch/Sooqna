/** Relative listing age in Arabic (cards / summaries). */
export function formatListedAgo(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "اليوم";
  const dayMs = 86_400_000;
  const days = Math.floor(diffMs / dayMs);
  if (days <= 0) return "اليوم";
  if (days === 1) return "منذ يوم";
  if (days < 7) return `منذ ${days} أيام`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? "منذ أسبوع" : `منذ ${weeks} أسابيع`;
  const months = Math.floor(days / 30);
  if (months < 12) return months <= 1 ? "منذ شهر" : `منذ ${months} أشهر`;
  return "منذ أكثر من سنة";
}
