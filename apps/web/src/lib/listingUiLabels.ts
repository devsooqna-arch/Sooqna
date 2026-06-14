import type { ListingCondition, ListingStatus } from "@/types/listing";

export function listingStatusLabel(status: ListingStatus): string {
  const labels: Record<ListingStatus, string> = {
    draft: "مسودة",
    pending: "بانتظار المراجعة",
    published: "منشور",
    rejected: "مرفوض",
    sold: "مباع",
    archived: "مؤرشف",
  };

  return labels[status];
}

export function listingConditionLabel(condition: ListingCondition): string {
  const labels: Record<ListingCondition, string> = {
    new: "جديد",
    used: "مستعمل",
  };

  return labels[condition];
}

export function iconActionLabel(action: "favorite-add" | "favorite-remove" | "message" | "share"): string {
  const labels = {
    "favorite-add": "إضافة إلى المفضلة",
    "favorite-remove": "إزالة من المفضلة",
    message: "مراسلة البائع",
    share: "مشاركة الإعلان",
  } as const;

  return labels[action];
}
