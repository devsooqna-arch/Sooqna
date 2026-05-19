"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme, type AppTheme } from "@/contexts/theme-context";
import { useAnimatedPresence } from "@/hooks/useAnimatedPresence";

const THEMES: { key: AppTheme; label: string; dot: string }[] = [
  { key: "classic", label: "كلاسيكي", dot: "bg-green-600" },
  { key: "light",   label: "فاتح",    dot: "bg-gray-100 border border-gray-300" },
  { key: "dark",    label: "داكن",    dot: "bg-gray-700" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { shouldRender, motionState } = useAnimatedPresence(open);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Mobile: 3-dot button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="تغيير الثيم"
        className="motion-press flex h-8 w-8 items-center justify-center rounded-full border border-[var(--chip-border)] bg-[var(--surface)] text-lg font-bold leading-none text-[var(--text-muted)] transition-colors hover:bg-[var(--chip)] md:hidden"
      >
        ⋮
      </button>

      {/* Mobile dropdown */}
      {shouldRender && (
        <div
          className="motion-dropdown absolute left-0 top-10 z-50 min-w-[120px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg md:hidden"
          data-motion-state={motionState}
        >
          {THEMES.map(({ key, label, dot }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTheme(key); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                key === theme
                  ? "bg-[var(--brand)] text-[var(--brand-contrast)] font-semibold"
                  : "text-[var(--text)] hover:bg-[var(--chip)]"
              }`}
            >
              <span className={`h-3 w-3 shrink-0 rounded-full ${dot}`} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Desktop: 3 buttons side by side */}
      <div className="hidden items-center rounded-full border border-[var(--chip-border)] bg-[var(--surface)] p-1 md:flex">
        {THEMES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            className={`motion-press rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              key === theme
                ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                : "text-[var(--text-muted)] hover:bg-[var(--chip)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
