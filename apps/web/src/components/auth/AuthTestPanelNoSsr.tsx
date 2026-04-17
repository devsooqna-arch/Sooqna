"use client";

import dynamic from "next/dynamic";

const AuthTestPanel = dynamic(
  () => import("@/components/auth/AuthTestPanel").then((mod) => mod.AuthTestPanel),
  { ssr: false }
);

export function AuthTestPanelNoSsr() {
  return <AuthTestPanel />;
}
