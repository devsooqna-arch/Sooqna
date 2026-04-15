"use client";

import { useMemo, useState } from "react";
import { reseedCategoriesFromUi } from "@/services/adminService";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreUserDoc } from "@/hooks/useFirestoreUserDoc";

type Notice = {
  kind: "success" | "error";
  text: string;
} | null;

export default function AdminSeedPage() {
  const { currentUser, loading } = useAuth();
  const { data: userDoc, loading: userDocLoading } = useFirestoreUserDoc(
    currentUser?.uid
  );
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const isAdmin = useMemo(
    () => String(userDoc?.role ?? "") === "admin",
    [userDoc]
  );

  async function handleSeed(): Promise<void> {
    setNotice(null);
    setSubmitting(true);
    try {
      const result = await reseedCategoriesFromUi();
      setNotice({
        kind: "success",
        text: `Done. Seeded ${result.count} categories: ${result.categoryIds.join(", ")}`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reseed categories.";
      setNotice({
        kind: "error",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || userDocLoading) {
    return <main className="p-6">Checking session...</main>;
  }

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Admin Seed</h1>
        <p className="mt-3 text-sm text-slate-600">
          Please sign in first, then open this page again.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Admin Seed</h1>
      <p className="mt-2 text-sm text-slate-600">
        Dev utility to re-run category seed from UI.
      </p>

      {!isAdmin ? (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          This page is visible, but execution is protected by backend admin role.
          Your account is not marked as admin in this UI check.
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSeed}
        disabled={submitting}
        className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? "Seeding..." : "Reseed categories"}
      </button>

      {notice ? (
        <p
          className={`mt-4 rounded-md p-3 text-sm ${
            notice.kind === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border border-red-300 bg-red-50 text-red-900"
          }`}
        >
          {notice.text}
        </p>
      ) : null}
    </main>
  );
}

