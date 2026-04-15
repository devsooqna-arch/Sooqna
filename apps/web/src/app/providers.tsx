"use client";

import type { ReactNode } from "react";
import { AuthProfileBootstrap } from "@/components/AuthProfileBootstrap";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthProfileBootstrap />
      {children}
    </>
  );
}
