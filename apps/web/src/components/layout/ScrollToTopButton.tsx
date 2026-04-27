"use client";

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="rounded-full bg-[var(--brand)] px-4 py-1.5 text-[var(--brand-contrast)]"
    >
      أعلى ↑
    </button>
  );
}
