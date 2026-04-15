"use client";

import { useEffect } from "react";
import { subscribeEnsureUserProfile } from "@/services/createUserProfile";

/**
 * Registers the auth listener that creates `users/{uid}` when missing.
 * Mount once near the root of the app (inside a client boundary).
 */
export function AuthProfileBootstrap(): null {
  useEffect(() => {
    const unsubscribe = subscribeEnsureUserProfile((err) => {
      console.error("[AuthProfileBootstrap]", err);
    });
    return () => unsubscribe();
  }, []);

  return null;
}
