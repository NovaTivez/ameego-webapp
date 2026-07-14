import type { Metadata } from "next";

import { InterviewSimulator } from "@/components/InterviewSimulator";

export const metadata: Metadata = {
  title: "Interview Simulator",
  description:
    "Set up a grounded practice interview, answer personalized questions, and save a completed attempt.",
};

export default function PracticePage() {
  return <InterviewSimulator />;
}
