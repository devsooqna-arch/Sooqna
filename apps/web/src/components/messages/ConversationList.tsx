"use client";

import type { Conversation } from "@/types/message";
import { ConversationListItem } from "./ConversationListItem";

export function ConversationList({
  conversations,
  activeConversationId,
  currentUserId,
  totalUnread,
  loading,
  onSelectConversation,
  onRefresh,
}: {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUserId: string;
  totalUnread: number;
  loading: boolean;
  onSelectConversation: (id: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[var(--text)]">المحادثات</h2>
          {totalUnread > 0 && (
            <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-contrast)]">
              {totalUnread}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--brand)] disabled:opacity-50"
        >
          {loading ? "..." : "تحديث"}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length ? (
          <div className="space-y-1">
            {conversations.map((item) => (
              <ConversationListItem
                key={item.id}
                conversation={item}
                currentUserId={currentUserId}
                isActive={item.id === activeConversationId}
                onSelect={() => onSelectConversation(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-4 py-10">
            <p className="text-center text-sm text-[var(--text-muted)]">
              {loading ? "جاري التحميل..." : "لا توجد محادثات بعد"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
