import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { EditListingPageView } from "@/components/listings/EditListingPageView";
import { noIndexMetadata } from "@/lib/seo";

type EditListingPageProps = {
  params: Promise<{ listingId: string }>;
};

export async function generateMetadata({ params }: EditListingPageProps): Promise<Metadata> {
  const { listingId } = await params;
  return noIndexMetadata(`تعديل إعلان | ${listingId}`, "تعديل بيانات الإعلان وإدارته.");
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { listingId } = await params;
  return (
    <PublicShell pageTitle="تعديل الإعلان" pageDescription="حدث تفاصيل إعلانك أو قم بحذفه.">
      <EditListingPageView listingId={listingId} />
    </PublicShell>
  );
}
