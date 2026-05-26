import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { RequireAdminGate } from "@/components/admin/RequireAdminGate";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "لوحة الإدارة | سوقنا",
  "لوحة إدارة سوقنا للإشراف على الإعلانات والمستخدمين والبلاغات."
);

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <RequireAdminGate>
          <AdminDashboard />
        </RequireAdminGate>
      </div>
    </main>
  );
}
