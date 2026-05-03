import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { FavoritesPageView } from "@/components/favorites/FavoritesPageView";

export const metadata: Metadata = {
  title: "المفضلة",
  description: "إدارة الإعلانات المحفوظة في المفضلة.",
};

export default function FavoritesPage() {
  return (
    <PublicShell pageTitle="المفضلة" pageDescription="راجع الإعلانات التي قمت بحفظها مسبقًا.">
      <FavoritesPageView />
    </PublicShell>
  );
}
