import type { Metadata } from "next";

import { CourseOverview } from "@/components/CourseOverview";
import { interviewFoundationsCourse } from "@/content/interview-foundations";

export const metadata: Metadata = { title: "Interview Foundations" };

export default function LearnPage() {
  return (
    <div className="page-stack course-page">
      <CourseOverview course={interviewFoundationsCourse} />
    </div>
  );
}
