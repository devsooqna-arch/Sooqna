"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Conversation, Message } from "@/types/message";
import { ModernAvatar } from "@/components/ui/ModernAvatar";
import {
  ChatBubble,
  ChatDateSeparator,
  shouldShowAvatar,
  shouldShowDateSeparator,
} from "./ChatBubble";

export function ChatPanel({
  conversation,
  messages,
  currentUserId,
  loading,
  onSendMessage,
  sendingMessage,
  onBack,
}: {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  onSendMessage: (text: string) => void;
  sendingMessage: boolean;
  onBack?: () => void;
}) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sendingMessage) return;
    onSendMessage(trimmed);
    setText("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
        <span className="mb-3 text-4xl">💬</span>
        <p className="text-sm font-semibold text-[var(--text)]">اختر محادثة للبدء</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          اختر محادثة من القائمة، أو افتح محادثة من صفحة إعلان عبر &laquo;راسل البائع&raquo;
        </p>
      </div>
    );
  }

  const otherId =
    conversation.participantIds.find((id) => id !== currentUserId) ??
    conversation.participantIds[0];
  const otherParticipant = conversation.participants[otherId];
  const otherName = otherParticipant?.fullName?.trim() || "مستخدم";
  const otherPhoto = otherParticipant?.photoURL;

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-2.5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)]"
            aria-label="رجوع"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
        <ModernAvatar src={otherPhoto} name={otherName} size="sm" status="online" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--text)]">{otherName}</p>
          <p className="truncate text-xs text-[var(--brand)]">
            {conversation.listingSnapshot.title || "محادثة"}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && !messages.length ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[var(--text-muted)]">جاري التحميل...</p>
          </div>
        ) : messages.length ? (
          <div className="space-y-1">
            {messages.map((msg, index) => {
              const prev = index > 0 ? messages[index - 1] : undefined;
              const isOwn = msg.senderId === currentUserId;
              const sender = conversation.participants[msg.senderId];
              const showDate = shouldShowDateSeparator(msg, prev);
              const showAv = shouldShowAvatar(msg, prev);

              return (
                <div key={msg.id}>
                  {showDate && <ChatDateSeparator date={msg.createdAt} />}
                  <div className={showAv && !showDate ? "mt-3" : "mt-0.5"}>
                    <ChatBubble
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={showAv}
                      senderName={sender?.fullName?.trim() || "مستخدم"}
                      senderPhoto={sender?.photoURL}
                    />
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[var(--text-muted)]">لا توجد رسائل بعد — ابدأ المحادثة!</p>
          </div>
        )}
      </div>

      {/* Compose area */}
      <div className="border-t border-[var(--border)] px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك..."
            rows={1}
            className="ui-input h-[44px] max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl py-2.5"
            disabled={sendingMessage}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sendingMessage}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--brand-contrast)] transition-opacity hover:opacity-90 disabled:opacity-40"
            aria-label="إرسال"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="rotate-180">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
          Enter للإرسال • Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
}
