import type { Metadata } from "next";

import { AcademyDashboard } from "@/components/AcademyDashboard";

export const metadata: Metadata = {
  title: "Academy Hub",
  description:
    "Your AMEEGO Academy learning, practice, progress, and achievement dashboard.",
};

export default function AcademyDashboardPage() {
  return <AcademyDashboard />;
}
