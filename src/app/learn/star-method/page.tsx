import type { Metadata } from "next";

import { StarLesson } from "@/components/StarLesson";
import { starMethodLesson } from "@/content/interview-foundations";

export const metadata: Metadata = {
  title: "The STAR Method",
  description: starMethodLesson.summary,
};

export default function StarMethodPage() {
  return (
    <div className="page-stack lesson-page">
      <StarLesson lesson={starMethodLesson} />
    </div>
  );
}
