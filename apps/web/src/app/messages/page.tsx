import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { MessagesWorkspace } from "@/components/messages/MessagesWorkspace";

export const metadata: Metadata = {
  title: "الرسائل",
  description: "إدارة محادثاتك ورسائلك داخل سوقنا.",
};

type MessagesPageProps = {
  searchParams: Promise<{ conversation?: string }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;
  const initialConversationId = params.conversation ?? "";

  return (
    <PublicShell
      pageTitle="الرسائل"
      pageDescription="راسل البائعين وتابع محادثاتك في مكان واحد."
    >
      <MessagesWorkspace initialConversationId={initialConversationId} />
    </PublicShell>
  );
}
