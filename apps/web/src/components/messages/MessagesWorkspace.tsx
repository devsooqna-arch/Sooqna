"use client";

import { useCallback, useEffect, useState } from "react";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ar-JO", { dateStyle: "short", timeStyle: "short" });
}
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import {
  createConversation,
  createMessage,
  enqueuePendingMessage,
  flushPendingMessages,
  getConversationById,
  getConversationMessages,
  getMyConversations,
  getUnreadSummary,
  markConversationRead,
} from "@/services/messageService";
import type { Conversation, Message } from "@/types/message";
import { ModernAvatar } from "@/components/ui/ModernAvatar";

export function MessagesWorkspace({ initialConversationId = "" }: { initialConversationId?: string }) {
  const { currentUser } = useAuth();
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [listingId, setListingId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inbox, setInbox] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshInbox = useCallback(async () => {
    if (!currentUser) return;
    setInboxLoading(true);
    try {
      const [conversations, unreadSummary] = await Promise.all([
        getMyConversations(),
        getUnreadSummary(),
      ]);
      setInbox(conversations);
      setUnreadTotal(unreadSummary.totalUnread);
    } finally {
      setInboxLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!initialConversationId) return;
    setConversationId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    if (!currentUser) return;
    void refreshInbox();
  }, [currentUser, refreshInbox]);

  useEffect(() => {
    void flushPendingMessages().then((count) => {
      if (count > 0) void refreshInbox();
    });
  }, [refreshInbox]);

  const refreshConversationData = useCallback(async (targetConversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [conversationData, messagesData] = await Promise.all([
        getConversationById(targetConversationId),
        getConversationMessages(targetConversationId),
      ]);
      setConversation(conversationData);
      setMessages(messagesData);
      await markConversationRead(targetConversationId);
      await refreshInbox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation.");
    } finally {
      setLoading(false);
    }
  }, [refreshInbox]);

  useEffect(() => {
    if (!conversationId) return;
    void refreshConversationData(conversationId);
  }, [conversationId, refreshConversationData]);

  async function handleCreateConversation() {
    if (!currentUser) return;
    if (!listingId.trim()) {
      setError("معرّف الإعلان مطلوب لإنشاء محادثة.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const participantIds = [currentUser.uid];
      if (participantId.trim() && participantId.trim() !== currentUser.uid) {
        participantIds.push(participantId.trim());
      }
      const result = await createConversation({
        participantIds,
        participants: {
          [currentUser.uid]: {
            fullName: currentUser.displayName ?? "",
            photoURL: currentUser.photoURL ?? "",
          },
          ...(participantId.trim() && participantId.trim() !== currentUser.uid
            ? {
                [participantId.trim()]: { fullName: "", photoURL: "" },
              }
            : {}),
        },
        listingId: listingId.trim(),
        listingSnapshot: {
          title: "Listing conversation",
          primaryImageURL: "",
        },
        createdBy: currentUser.uid,
      });
      setConversationId(result.conversationId);
      await refreshInbox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!currentUser || !conversationId.trim() || !messageText.trim()) return;
    setLoading(true);
    setError(null);
    const optimisticMessage: Message = {
      id: `tmp-${Date.now()}`,
      senderId: currentUser.uid,
      type: "text",
      text: messageText.trim(),
      attachments: [],
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    try {
      await createMessage(conversationId.trim(), {
        senderId: currentUser.uid,
        type: "text",
        text: messageText.trim(),
      });
      setMessageText("");
      await refreshConversationData(conversationId.trim());
      await refreshInbox();
    } catch (err) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueuePendingMessage(conversationId.trim(), {
          senderId: currentUser.uid,
          type: "text",
          text: messageText.trim(),
        });
        setMessageText("");
        setError("أنت غير متصل الآن. تم حفظ الرسالة محلياً وسيتم إرسالها عند عودة الاتصال.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to send message.");
        setMessages((prev) => prev.filter((item) => item.id !== optimisticMessage.id));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل فتح الرسائل...">
      <div className="space-y-5">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">صندوق المحادثات</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold">
                غير مقروء: {unreadTotal}
              </span>
              <button
                type="button"
                onClick={() => void refreshInbox()}
                disabled={inboxLoading}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold"
              >
                {inboxLoading ? "..." : "تحديث"}
              </button>
            </div>
          </div>

          {inbox.length ? (
            <div className="space-y-2">
              {inbox.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setConversationId(item.id)}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-start text-sm shadow-[var(--shadow-sm)] transition hover:border-[var(--brand)] hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex items-center gap-2">
                    <ModernAvatar
                      src={
                        item.participants[
                          item.participantIds.find((id) => id !== currentUser?.uid) || item.participantIds[0]
                        ]?.photoURL
                      }
                      name={
                        item.participants[
                          item.participantIds.find((id) => id !== currentUser?.uid) || item.participantIds[0]
                        ]?.fullName || "مستخدم"
                      }
                      size="sm"
                      status="online"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.listingSnapshot.title || "بدون عنوان"}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">
                        {item.lastMessageText || "لا يوجد رسائل بعد"} • {formatDate(item.updatedAt)}
                      </p>
                    </div>
                    {(item.unreadCount ?? 0) > 0 ? (
                      <span className="inline-block rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-contrast)]">
                        {item.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">لا توجد محادثات حتى الآن.</p>
          )}
        </section>

        <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:grid-cols-2 sm:p-6">
          <label className="space-y-1">
            <span className="text-sm font-medium">معرّف الإعلان (لإنشاء محادثة)</span>
            <input
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              placeholder="listing id"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">معرّف الطرف الآخر (اختياري)</span>
            <input
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              placeholder="uid"
            />
          </label>

          <button
            type="button"
            onClick={() => void handleCreateConversation()}
            disabled={loading}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-contrast)] transition hover:opacity-90 disabled:opacity-60"
          >
            إنشاء محادثة جديدة
          </button>

          <label className="space-y-1">
            <span className="text-sm font-medium">معرّف المحادثة</span>
            <input
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              placeholder="conversation id"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          {error ? (
            <p className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {conversation ? (
            <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-muted)]">
              <p>المحادثة: {conversation.id}</p>
              <p>الإعلان: {conversation.listingId}</p>
              <p>عدد المشاركين: {conversation.participantIds.length}</p>
            </div>
          ) : (
            <p className="mb-3 text-sm text-[var(--text-muted)]">
              أدخل معرّف محادثة أو أنشئ محادثة جديدة للبدء.
            </p>
          )}

          <div className="space-y-3">
            <label className="space-y-1">
              <span className="text-sm font-medium">رسالة جديدة</span>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                placeholder="اكتب رسالتك..."
              />
            </label>
            <button
              type="button"
              onClick={() => void handleSendMessage()}
              disabled={loading || !conversationId.trim() || !messageText.trim()}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60"
            >
              إرسال الرسالة
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 text-base font-semibold">سجل الرسائل</h2>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">جاري التحميل...</p>
          ) : messages.length ? (
            <div className="space-y-2">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-start gap-2">
                    <ModernAvatar
                      src={conversation?.participants[message.senderId]?.photoURL}
                      name={conversation?.participants[message.senderId]?.fullName || "مستخدم"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[var(--text-muted)]">
                        {conversation?.participants[message.senderId]?.fullName || message.senderId} • {formatDate(message.createdAt)}
                      </p>
                      <p className="mt-1">{message.text || "(بدون نص)"}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">لا توجد رسائل بعد.</p>
          )}
        </section>
      </div>
    </RequireAuthGate>
  );
}
