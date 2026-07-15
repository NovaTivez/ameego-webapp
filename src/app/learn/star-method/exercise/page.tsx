import type { Metadata } from "next";

import { StarArrangementExercise } from "@/components/StarArrangementExercise";
import { starArrangementExercise } from "@/content/star-arrangement-exercise";

export const metadata: Metadata = {
  title: "STAR Arrangement Exercise",
  description: starArrangementExercise.instructions,
};

export default function StarExercisePage() {
  return (
    <div className="page-stack exercise-page">
      <StarArrangementExercise exercise={starArrangementExercise} />
    </div>
  );
}
