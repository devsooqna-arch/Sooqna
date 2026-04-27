import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { EditListingPageView } from "@/components/listings/EditListingPageView";

type EditListingPageProps = {
  params: Promise<{ listingId: string }>;
};

export async function generateMetadata({ params }: EditListingPageProps): Promise<Metadata> {
  const { listingId } = await params;
  return {
    title: `تعديل إعلان | ${listingId}`,
    description: "تعديل بيانات الإعلان وإدارته.",
  };
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { listingId } = await params;
  return (
    <PublicShell pageTitle="تعديل الإعلان" pageDescription="حدث تفاصيل إعلانك أو قم بحذفه.">
      <EditListingPageView listingId={listingId} />
    </PublicShell>
  );
}
