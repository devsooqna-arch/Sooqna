"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import * as authService from "@/services/authService";
import { apiFetch } from "@/services/apiClient";
import { ensureUserProfile } from "@/services/userProfileService";

function debugAuth(...args: unknown[]) {
  // Toggle with: NEXT_PUBLIC_AUTH_DEBUG=true
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === "true") {
    console.log("[AuthDebug]", ...args);
  }
}

export type AuthContextValue = {
  currentUser: User | null;
  loading: boolean;
  /** Create account with email/password + display name; ensures backend profile. */
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ emailVerified: boolean }>;
  /** Email/password — throws on failure (handle in UI with `getAuthErrorMessage`). */
  login: (email: string, password: string) => Promise<{ emailVerified: boolean }>;
  /** Google via redirect (reliable in real browsers; avoids blank firebaseapp.com handler in embedded browsers). */
  loginWithGoogle: () => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const safety = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 8000);

    void authService
      .completeGoogleRedirectIfNeeded()
      .then((cred) => {
        debugAuth("completeGoogleRedirectIfNeeded resolved", {
          hasCred: !!cred,
          uid: cred?.user?.uid ?? null,
          email: cred?.user?.email ?? null,
        });
        if (cred?.user && !cancelled) {
          debugAuth("Redirect result received", {
            uid: cred.user.uid,
            email: cred.user.email,
            provider: cred.user.providerData?.[0]?.providerId ?? null,
          });
          void ensureUserProfile(cred.user)
            .then(({ created }) => {
              debugAuth("ensureUserProfile after redirect", {
                uid: cred.user.uid,
                created,
              });
            })
            .catch((err) => {
              debugAuth("ensureUserProfile after redirect FAILED", err);
            });
        }
      })
      .catch((err) => {
        debugAuth("completeGoogleRedirectIfNeeded FAILED", err);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      debugAuth("onAuthStateChanged", {
        hasUser: !!user,
        uid: user?.uid ?? null,
        email: user?.email ?? null,
      });
      setCurrentUser(user);
      setLoading(false);
      clearTimeout(safety);

      // Safety net for all providers (email/google/etc):
      // whenever a user session exists, ensure backend profile exists/updated.
      if (user) {
        void ensureUserProfile(user)
          .then(({ created }) => {
            debugAuth("ensureUserProfile on auth state", { uid: user.uid, created });
          })
          .catch((err) => {
            debugAuth("ensureUserProfile on auth state FAILED", err);
          });
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(safety);
      unsubscribe();
    };
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    debugAuth("register:start", { email });
    const cred = await authService.signUpWithEmailAndPassword(email, password);
    const name = fullName.trim();
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    const result = await ensureUserProfile(cred.user, { fullName: name });
    debugAuth("register:ensureUserProfile", {
      uid: cred.user.uid,
      created: result.created,
    });
    return { emailVerified: cred.user.emailVerified };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    debugAuth("login:start", { email });
    const cred = await authService.loginWithEmailAndPassword(email, password);
    const result = await ensureUserProfile(cred.user);
    debugAuth("login:ensureUserProfile", {
      uid: cred.user.uid,
      created: result.created,
    });
    return { emailVerified: cred.user.emailVerified };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    debugAuth("google:start popup");
    try {
      // Preferred path for normal browsers.
      const cred = await authService.loginWithGooglePopup();
      debugAuth("google:popup success", {
        uid: cred.user.uid,
        email: cred.user.email,
      });
      const result = await ensureUserProfile(cred.user);
      debugAuth("google:ensureUserProfile after popup", {
        uid: cred.user.uid,
        created: result.created,
      });
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: string }).code)
          : "";
      debugAuth("google:popup failed", { code, error });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const resendEmailVerification = useCallback(async () => {
    // Apply backend policy + rate limit first.
    await apiFetch<{ success: true; data: { allowed: boolean; alreadyVerified: boolean } }>(
      "/auth/resend-verification",
      {
        method: "POST",
        authenticated: true,
      }
    );
    await authService.sendVerificationEmailToCurrentUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading,
      register,
      login,
      loginWithGoogle,
      resendEmailVerification,
      logout,
    }),
    [currentUser, loading, register, login, loginWithGoogle, resendEmailVerification, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
