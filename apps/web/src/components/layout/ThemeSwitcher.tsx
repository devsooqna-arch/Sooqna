"use client";

import { useTheme, type AppTheme } from "@/contexts/theme-context";

const THEME_LABELS: Record<AppTheme, string> = {
  classic: "كلاسيكي",
  light: "فاتح",
  dark: "داكن",
};

export function ThemeSwitcher() {
  const { theme, setTheme, cycleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* cycle button — only visible on mobile where the 3-button selector is hidden */}
      <button
        type="button"
        onClick={cycleTheme}
        className="rounded-full border border-[var(--chip-border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--chip)] sm:hidden"
      >
        {THEME_LABELS[theme]}
      </button>

      <div className="hidden items-center rounded-full border border-[var(--chip-border)] bg-[var(--surface)] p-1 sm:flex">
        {(["classic", "light", "dark"] as AppTheme[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTheme(option)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              option === theme
                ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                : "text-[var(--text-muted)] hover:bg-[var(--chip)]"
            }`}
          >
            {THEME_LABELS[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
