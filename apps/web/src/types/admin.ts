import type { ListingStatus } from "@/types/listing";

export type AdminRole = "ADMIN" | "BUYER" | "SELLER";
export type AdminAccountStatus = "active" | "suspended" | "deleted";
export type AdminReportStatus = "open" | "in_review" | "resolved" | "rejected";

export type AdminPagination = {
  total: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminUser = {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: AdminRole;
  accountStatus: AdminAccountStatus;
  isEmailVerified: boolean;
  totalListings?: number;
  totalSold?: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminListing = {
  id: string;
  title: string;
  ownerId: string | null;
  ownerSnapshotName: string;
  categoryId: string;
  locationCity: string;
  status: ListingStatus;
  isFeatured: boolean;
  isApproved: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  imageCount?: number;
};

export type AdminReport = {
  id: string;
  targetType: "listing" | "message" | "user";
  targetId: string;
  reasonCode: "spam" | "abuse" | "fraud" | "inappropriate" | "other";
  details: string;
  reporterId: string;
  status: AdminReportStatus;
  moderatorId: string | null;
  moderatorNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
  name?: {
    ar: string;
    en: string;
  };
};

export type AdminAuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdminStats = {
  users: {
    total: number;
    active: number;
    suspended: number;
  };
  listings: {
    total: number;
    published: number;
    draft: number;
    sold: number;
    archivedOrRejected: number;
  };
  reports: {
    open: number;
  };
  recentAuditActions: Array<Pick<AdminAuditLog, "id" | "actorId" | "action" | "targetType" | "targetId" | "createdAt">>;
};

export type AdminListResponse<T> = {
  data: T[];
  pagination: AdminPagination;
};
