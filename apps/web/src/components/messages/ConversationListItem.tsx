"use client";

import type { Conversation } from "@/types/message";
import { ModernAvatar } from "@/components/ui/ModernAvatar";

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `${diffMin} د`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} س`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} ي`;
  return d.toLocaleDateString("ar-JO", { day: "numeric", month: "short" });
}

export function ConversationListItem({
  conversation,
  currentUserId,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const otherId =
    conversation.participantIds.find((id) => id !== currentUserId) ??
    conversation.participantIds[0];
  const otherParticipant = conversation.participants[otherId];
  const otherName = otherParticipant?.fullName?.trim() || "مستخدم";
  const otherPhoto = otherParticipant?.photoURL;

  const listingTitle = conversation.listingSnapshot.title || "بدون عنوان";
  const lastMessage = conversation.lastMessageText || "لا يوجد رسائل بعد";
  const timeLabel = formatRelativeTime(conversation.lastMessageAt ?? conversation.updatedAt);
  const unread = conversation.unreadCount ?? 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`block w-full rounded-xl px-3 py-2.5 text-start transition-colors ${
        isActive
          ? "border border-[var(--brand)] bg-[var(--accent-soft)]"
          : "border border-transparent hover:bg-[var(--surface-muted)]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <ModernAvatar src={otherPhoto} name={otherName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[var(--text)]">{otherName}</p>
            <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{timeLabel}</span>
          </div>
          <p className="truncate text-xs font-medium text-[var(--brand)]">{listingTitle}</p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-[var(--text-muted)]">{lastMessage}</p>
            {unread > 0 && (
              <span className="shrink-0 rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--brand-contrast)]">
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
