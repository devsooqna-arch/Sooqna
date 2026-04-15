"use client";

import type { ReactNode } from "react";
import { AuthProfileBootstrap } from "@/components/AuthProfileBootstrap";
import { AuthProvider } from "@/hooks/useAuth";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthProfileBootstrap />
      {children}
    </AuthProvider>
  );
}
