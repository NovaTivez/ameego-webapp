import type { Metadata } from "next";

import { ProgressDashboard } from "@/components/ProgressDashboard";
import styles from "@/components/progress-dashboard.module.css";

export const metadata: Metadata = {
  title: "Progress Library",
  description:
    "Review completed learning activity, saved attempts, and evidence-based attempt comparisons.",
};

export default function ProgressPage() {
  return (
    <div className={`${styles.page} progress-library-page`}>
      <ProgressDashboard />
    </div>
  );
}
