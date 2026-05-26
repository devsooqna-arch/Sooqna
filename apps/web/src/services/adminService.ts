import { apiFetch } from "@/services/apiClient";
import type {
  AdminAccountStatus,
  AdminAuditLog,
  AdminCategory,
  AdminListResponse,
  AdminListing,
  AdminReport,
  AdminReportStatus,
  AdminRole,
  AdminStats,
  AdminUser,
} from "@/types/admin";
import type { ListingStatus } from "@/types/listing";

function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await apiFetch<{ success: true; data: AdminStats }>("/admin/stats", {
    authenticated: true,
  });
  return response.data;
}

export async function getAdminListings(params: {
  limit?: number;
  offset?: number;
  status?: ListingStatus | "";
  category?: string;
  city?: string;
  search?: string;
  featured?: boolean;
}): Promise<AdminListResponse<AdminListing>> {
  const response = await apiFetch<{ success: true; data: AdminListing[]; pagination: AdminListResponse<AdminListing>["pagination"] }>(
    `/admin/listings${queryString(params)}`,
    { authenticated: true }
  );
  return { data: response.data, pagination: response.pagination };
}

export async function runAdminListingAction(
  listingId: string,
  action: "publish" | "reject" | "archive" | "sold" | "feature" | "unfeature",
  reason?: string
): Promise<AdminListing> {
  const response = await apiFetch<{ success: true; data: AdminListing }>(
    `/admin/listings/${listingId}/${action}`,
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(reason ? { reason } : {}),
    }
  );
  return response.data;
}

export async function getAdminUsers(params: {
  limit?: number;
  offset?: number;
  role?: AdminRole | "";
  status?: AdminAccountStatus | "";
  search?: string;
}): Promise<AdminListResponse<AdminUser>> {
  const response = await apiFetch<{ success: true; data: AdminUser[]; pagination: AdminListResponse<AdminUser>["pagination"] }>(
    `/admin/users${queryString(params)}`,
    { authenticated: true }
  );
  return { data: response.data, pagination: response.pagination };
}

export async function updateAdminUser(
  firebaseUid: string,
  patch: { role?: AdminRole; accountStatus?: AdminAccountStatus }
): Promise<AdminUser> {
  const response = await apiFetch<{ success: true; data: AdminUser }>(`/admin/users/${firebaseUid}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(patch),
  });
  return response.data;
}

export async function getAdminReports(params: {
  limit?: number;
  offset?: number;
  status?: AdminReportStatus | "";
  targetType?: "listing" | "message" | "user" | "";
  reason?: string;
}): Promise<AdminListResponse<AdminReport>> {
  const response = await apiFetch<{ success: true; data: AdminReport[]; pagination: AdminListResponse<AdminReport>["pagination"] }>(
    `/admin/reports${queryString(params)}`,
    { authenticated: true }
  );
  return { data: response.data, pagination: response.pagination };
}

export async function updateAdminReport(
  reportId: string,
  status: AdminReportStatus,
  note?: string
): Promise<AdminReport> {
  const response = await apiFetch<{ success: true; data: AdminReport }>(`/admin/reports/${reportId}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({ status, note }),
  });
  return response.data;
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const response = await apiFetch<{ success: true; data: AdminCategory[] }>("/admin/categories", {
    authenticated: true,
  });
  return response.data;
}

export async function createAdminCategory(input: {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  sortOrder?: number;
}): Promise<AdminCategory> {
  const response = await apiFetch<{ success: true; data: AdminCategory }>("/admin/categories", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateAdminCategory(
  id: string,
  patch: Partial<Pick<AdminCategory, "nameAr" | "nameEn" | "slug" | "isActive" | "sortOrder">>
): Promise<AdminCategory> {
  const response = await apiFetch<{ success: true; data: AdminCategory }>(`/admin/categories/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(patch),
  });
  return response.data;
}

export async function getAdminAuditLogs(params: {
  limit?: number;
  offset?: number;
  actor?: string;
  action?: string;
  targetType?: string;
}): Promise<AdminListResponse<AdminAuditLog>> {
  const response = await apiFetch<{ success: true; data: AdminAuditLog[]; pagination: AdminListResponse<AdminAuditLog>["pagination"] }>(
    `/admin/audit-logs${queryString(params)}`,
    { authenticated: true }
  );
  return { data: response.data, pagination: response.pagination };
}
