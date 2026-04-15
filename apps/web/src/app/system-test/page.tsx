import type { Metadata } from "next";
import { SystemTestDashboard } from "@/components/system-test/SystemTestDashboard";

export const metadata: Metadata = {
  title: "System Test Dashboard | Sooqna",
  description: "Milestone 1 end-to-end developer test dashboard",
};

export default function SystemTestPage() {
  return <SystemTestDashboard />;
}

