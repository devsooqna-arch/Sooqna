import type { Metadata } from "next";
import { DevToolsPanel } from "@/components/dev/DevToolsPanel";

export const metadata: Metadata = {
  title: "أدوات المطور | سوقنا",
  description: "لوحة اختبار تكامل الخادم الخلفي للمصادقة والإعلانات والمفضلة والرفع والرسائل.",
};

export default function DevToolsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <DevToolsPanel />
      </div>
    </main>
  );
}
