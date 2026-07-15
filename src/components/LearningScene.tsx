import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelRoomBackground } from "@/components/PixelRoomBackground";

type LearningSceneProps = {
  variant: "course" | "lesson" | "exercise";
};

const sceneCopy = {
  course: {
    label: "Interview Foundations classroom",
    board: "INTERVIEW FOUNDATIONS",
    note: "Choose a lesson at the classroom board.",
  },
  lesson: {
    label: "STAR lesson study room",
    board: "S  T  A  R",
    note: "Build one clear story, step by step.",
  },
  exercise: {
    label: "STAR exercise workshop",
    board: "ARRANGE → CHECK → RETRY",
    note: "The workbench is ready for your answer pieces.",
  },
} as const;

export function LearningScene({ variant }: LearningSceneProps) {
  const copy = sceneCopy[variant];
  return (
    <PixelRoomBackground
      variant="classroom"
      label={copy.label}
      className={`learning-scene learning-scene-${variant}`}
    >
      <div className="learning-blackboard">
        <span>{copy.board}</span>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="learning-scene-character">
        <CharacterPortrait variant="student" name="Ari, academy learner" compact />
      </div>
      <div className="learning-workbench" aria-hidden="true">
        <PixelIcon name={variant === "exercise" ? "progress" : "lesson"} size="large" />
        <span className="workbench-paper" />
        <span className="workbench-pencil" />
        <span className="workbench-mug" />
      </div>
      <div className="learning-scene-caption">{copy.note}</div>
    </PixelRoomBackground>
  );
}
