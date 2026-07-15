import type { Metadata } from "next";

import { ProgressDashboard } from "@/components/ProgressDashboard";

export const metadata: Metadata = { title: "Progress Library" };

export default function ProgressPage() {
  return <ProgressDashboard />;
}
