import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { FavoritesPageView } from "@/components/favorites/FavoritesPageView";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("المفضلة", "إدارة الإعلانات المحفوظة في المفضلة.");

export default function FavoritesPage() {
  return (
    <PublicShell pageTitle="المفضلة" pageDescription="راجع الإعلانات التي قمت بحفظها مسبقًا.">
      <FavoritesPageView />
    </PublicShell>
  );
}
