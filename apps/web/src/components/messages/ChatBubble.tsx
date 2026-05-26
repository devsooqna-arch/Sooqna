"use client";

import type { Message } from "@/types/message";
import { ModernAvatar } from "@/components/ui/ModernAvatar";

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-JO", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return "اليوم";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "أمس";
  return d.toLocaleDateString("ar-JO", { day: "numeric", month: "short", year: "numeric" });
}

export function ChatDateSeparator({ date }: { date: string | null | undefined }) {
  const label = formatDateSeparator(date);
  if (!label) return null;
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-px flex-1 bg-[var(--border)]" />
      <span className="text-[10px] font-semibold text-[var(--text-muted)]">{label}</span>
      <div className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

export function ChatBubble({
  message,
  isOwn,
  showAvatar,
  senderName,
  senderPhoto,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  senderName: string;
  senderPhoto?: string;
}) {
  const isOptimistic = message.id.startsWith("tmp-");

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar column */}
      <div className="w-8 shrink-0">
        {showAvatar && !isOwn ? (
          <ModernAvatar src={senderPhoto} name={senderName} size="sm" />
        ) : null}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {showAvatar && !isOwn && (
          <p className="mb-0.5 text-[10px] font-medium text-[var(--text-muted)]">{senderName}</p>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            isOwn
              ? "rounded-se-sm bg-[var(--brand)] text-[var(--brand-contrast)]"
              : "rounded-ss-sm bg-[var(--surface-muted)] text-[var(--text)]"
          } ${isOptimistic ? "opacity-70" : ""}`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text || "(بدون نص)"}</p>
        </div>
        <p
          className={`mt-0.5 flex items-center gap-1 text-[10px] text-[var(--text-muted)] ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          {formatTime(message.createdAt)}
          {isOptimistic && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="animate-spin opacity-50">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" opacity=".3"/>
              <path d="M20 12h2A10 10 0 0 0 12 2v2a8 8 0 0 1 8 8z"/>
            </svg>
          )}
        </p>
      </div>
    </div>
  );
}

export function shouldShowDateSeparator(
  current: Message,
  previous: Message | undefined
): boolean {
  if (!previous) return true;
  const a = current.createdAt ? new Date(current.createdAt).toDateString() : "";
  const b = previous.createdAt ? new Date(previous.createdAt).toDateString() : "";
  return a !== b;
}

export function shouldShowAvatar(
  current: Message,
  previous: Message | undefined
): boolean {
  if (!previous) return true;
  return current.senderId !== previous.senderId;
}
