"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { isEmailNotVerified } from "@/lib/apiError";
import { EmailVerificationBanner } from "@/components/ui/EmailVerificationBanner";
import {
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
import { ConversationList } from "./ConversationList";
import { ChatPanel } from "./ChatPanel";

const POLL_INTERVAL_MS = 20_000;

export function MessagesWorkspace({ initialConversationId = "" }: { initialConversationId?: string }) {
  const { currentUser } = useAuth();
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    initialConversationId ? "chat" : "list"
  );
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [inbox, setInbox] = useState<Conversation[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailUnverified, setEmailUnverified] = useState(false);

  const lastMessageCountRef = useRef(0);

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
    } catch (err) {
      if (isEmailNotVerified(err)) setEmailUnverified(true);
    } finally {
      setInboxLoading(false);
    }
  }, [currentUser]);

  const refreshConversationData = useCallback(async (targetId: string, silent = false) => {
    if (!silent) setChatLoading(true);
    setError(null);
    try {
      const [convoData, messagesData] = await Promise.all([
        getConversationById(targetId),
        getConversationMessages(targetId),
      ]);
      setConversation(convoData);
      if (messagesData.length !== lastMessageCountRef.current) {
        setMessages(messagesData);
        lastMessageCountRef.current = messagesData.length;
      }
      await markConversationRead(targetId);
      await refreshInbox();
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "فشل تحميل المحادثة.");
      }
    } finally {
      if (!silent) setChatLoading(false);
    }
  }, [refreshInbox]);

  useEffect(() => {
    if (!initialConversationId) return;
    setConversationId(initialConversationId);
    setMobileView("chat");
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

  useEffect(() => {
    if (!conversationId) return;
    lastMessageCountRef.current = 0;
    void refreshConversationData(conversationId);
  }, [conversationId, refreshConversationData]);

  // Polling
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      void refreshInbox();
      if (conversationId) {
        void refreshConversationData(conversationId, true);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentUser, conversationId, refreshInbox, refreshConversationData]);

  // Mobile back button support
  useEffect(() => {
    if (mobileView !== "chat") return;
    function handlePopState() {
      setMobileView("list");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [mobileView]);

  function handleSelectConversation(id: string) {
    setConversationId(id);
    setMobileView("chat");
    window.history.pushState({ messagesView: "chat" }, "");
  }

  function handleBack() {
    setMobileView("list");
    setConversationId("");
    setConversation(null);
    setMessages([]);
  }

  async function handleSendMessage(text: string) {
    if (!currentUser || !conversationId.trim()) return;
    setSendingMessage(true);
    setError(null);

    const optimisticMessage: Message = {
      id: `tmp-${Date.now()}`,
      senderId: currentUser.uid,
      type: "text",
      text,
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
        text,
      });
      lastMessageCountRef.current = 0;
      await refreshConversationData(conversationId.trim(), true);
    } catch (err) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueuePendingMessage(conversationId.trim(), {
          senderId: currentUser.uid,
          type: "text",
          text,
        });
        setError("أنت غير متصل الآن. تم حفظ الرسالة محلياً وسيتم إرسالها عند عودة الاتصال.");
      } else {
        setError(err instanceof Error ? err.message : "فشل إرسال الرسالة.");
        setMessages((prev) => prev.filter((item) => item.id !== optimisticMessage.id));
      }
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل فتح الرسائل...">
      {emailUnverified && <EmailVerificationBanner />}

      {error && (
        <p className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]" style={{ height: "calc(100vh - 260px)", minHeight: "480px" }}>
        {/* Desktop: side-by-side */}
        <div className="hidden h-full md:flex">
          <div className="w-80 shrink-0 border-e border-[var(--border)] bg-[var(--bg)]">
            <ConversationList
              conversations={inbox}
              activeConversationId={conversationId || null}
              currentUserId={currentUser?.uid ?? ""}
              totalUnread={unreadTotal}
              loading={inboxLoading}
              onSelectConversation={handleSelectConversation}
              onRefresh={() => void refreshInbox()}
            />
          </div>
          <div className="flex-1">
            <ChatPanel
              conversation={conversation}
              messages={messages}
              currentUserId={currentUser?.uid ?? ""}
              loading={chatLoading}
              onSendMessage={(t) => void handleSendMessage(t)}
              sendingMessage={sendingMessage}
            />
          </div>
        </div>

        {/* Mobile: toggle between list and chat */}
        <div className="flex h-full flex-col md:hidden">
          {mobileView === "list" ? (
            <ConversationList
              conversations={inbox}
              activeConversationId={conversationId || null}
              currentUserId={currentUser?.uid ?? ""}
              totalUnread={unreadTotal}
              loading={inboxLoading}
              onSelectConversation={handleSelectConversation}
              onRefresh={() => void refreshInbox()}
            />
          ) : (
            <ChatPanel
              conversation={conversation}
              messages={messages}
              currentUserId={currentUser?.uid ?? ""}
              loading={chatLoading}
              onSendMessage={(t) => void handleSendMessage(t)}
              sendingMessage={sendingMessage}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </RequireAuthGate>
  );
}
