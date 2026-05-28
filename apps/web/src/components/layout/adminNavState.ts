export type AdminNavProfile = {
  role?: string | null;
};

export function canShowAdminNav(profile: AdminNavProfile | null | undefined): boolean {
  return profile?.role === "ADMIN";
}
