"use client";

import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";

const sizeClassMap: Record<AvatarSize, string> = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
};

const statusDotMap: Record<AvatarSize, string> = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "م";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
}

export function ModernAvatar({
  src,
  name,
  size = "md",
  status,
  verified = false,
}: {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  status?: "online" | "offline";
  verified?: boolean;
}) {
  const sizeClass = sizeClassMap[size];
  const dotClass = statusDotMap[size];
  const initials = getInitials(name);

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeClass} overflow-hidden rounded-full border border-[var(--chip-border)] bg-gradient-to-b from-[var(--surface)] to-[var(--surface-muted)] shadow-[var(--shadow)]`}
      >
        {src ? (
          <Image src={src} alt={name} width={96} height={96} className="h-full w-full object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-semibold text-[var(--text)]">
            {initials}
          </div>
        )}
      </div>

      {verified ? (
        <span
          className="absolute -bottom-0.5 -left-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--surface)] bg-[var(--brand)] text-[11px] font-bold text-[var(--brand-contrast)]"
          aria-label="حساب موثّق"
          title="حساب موثّق"
        >
          ✓
        </span>
      ) : null}

      {status ? (
        <span
          className={`absolute -right-0.5 -bottom-0.5 ${dotClass} rounded-full border-2 border-[var(--surface)] ${status === "online" ? "bg-emerald-500" : "bg-[var(--text-muted)]"}`}
          aria-label={status === "online" ? "متصل" : "غير متصل"}
          title={status === "online" ? "متصل" : "غير متصل"}
        />
      ) : null}
    </div>
  );
}
