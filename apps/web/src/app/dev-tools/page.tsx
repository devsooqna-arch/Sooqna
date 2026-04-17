import type { Metadata } from "next";
import { DevToolsPanel } from "@/components/dev/DevToolsPanel";

export const metadata: Metadata = {
  title: "Dev Tools | Sooqna",
  description: "Backend integration testing panel for auth, listings, favorites, uploads, and messages.",
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
