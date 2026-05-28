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
  listingCount?: number;
  totalListings?: number;
  totalSold?: number;
  lastLoginAt?: string | null;
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

export type AdminCity = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  listingCount: number;
  createdAt: string | null;
  updatedAt: string | null;
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

export type AdminAnalytics = {
  kpis: {
    totalListings: number;
    publishedListings: number;
    totalUsers: number;
    newListingsToday: number;
    newListingsThisWeek: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    conversionRate: number;
  };
  listingStatuses: Array<{ status: ListingStatus; count: number }>;
  topCategories: Array<{ categoryId: string; nameAr: string; nameEn: string; listingCount: number }>;
  topCities: Array<{ city: string; listingCount: number }>;
  growth: {
    daily: Array<{ date: string; listings: number; users: number }>;
    weekly: Array<{ weekStart: string; weekEnd: string; listings: number; users: number }>;
  };
  latestActivities: Array<Pick<AdminAuditLog, "id" | "actorId" | "action" | "targetType" | "targetId" | "createdAt">>;
};

export type AdminModerationSla = {
  pendingCount: number;
  oldestPendingAgeHours: number;
  averageDecisionHours: number | null;
  pendingAgeBuckets: Array<{ label: string; count: number }>;
};

export type AdminTopListingMetric = "views" | "favorites" | "messages";

export type AdminTopListing = {
  id: string;
  title: string;
  status: ListingStatus;
  categoryId: string;
  locationCity: string;
  viewsCount: number;
  favoritesCount: number;
  messagesCount: number;
  createdAt: string;
};

export type AdminUserActivity = {
  activeUsers7d: number;
  activeUsers30d: number;
  usersWithListings7d: number;
  usersWithMessages7d: number;
  usersWithFavorites7d: number;
  newVsActive: Array<{ label: string; count: number }>;
};

export type AdminModerationLog = {
  id: string;
  listingId: string;
  adminUserId: string;
  action: string;
  reason: string | null;
  previousStatus: string | null;
  newStatus: string | null;
  createdAt: string;
};

export type AdminUserDetails = {
  user: AdminUser;
  recentListings: AdminListing[];
  recentActivity: AdminAuditLog[];
};

export type AdminHealthStatus = "healthy" | "warning" | "error" | "not_configured";

export type AdminHealth = {
  api: { status: AdminHealthStatus; message: string };
  database: { status: AdminHealthStatus; message: string };
  counts: {
    users: number;
    listings: number;
    categories: number;
    cities: number;
    uploads: number;
  };
  uploads: { status: AdminHealthStatus; bytes: number | null; message: string };
  firebaseAuth: {
    status: AdminHealthStatus;
    message: string;
    projectId: string | null;
    credentialMode: "service-account-file" | "service-account-env" | "application-default" | "not_configured";
    authUserCount: number | null;
    dbUserCount: number;
  };
  recentErrors: { status: AdminHealthStatus; items: string[]; message: string };
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
  topCities: Array<{ city: string; listingCount: number }>;
  recentAuditActions: Array<Pick<AdminAuditLog, "id" | "actorId" | "action" | "targetType" | "targetId" | "createdAt">>;
};

export type AdminListResponse<T> = {
  data: T[];
  pagination: AdminPagination;
};
