/**
 * Auth hook + provider live in `auth-context.tsx` (JSX).
 * Import `useAuth` and `AuthProvider` from here for a stable public API.
 */
export { AuthProvider, useAuth, type AuthContextValue } from "@/contexts/auth-context";
