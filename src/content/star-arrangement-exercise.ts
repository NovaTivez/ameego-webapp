export type StarSegmentId = "situation" | "task" | "action" | "result";

export type StarExerciseSegment = {
  id: StarSegmentId;
  label: "Situation" | "Task" | "Action" | "Result";
  text: string;
  correctPosition: number;
  placementHint: string;
};

export type StarArrangementExerciseData = {
  id: string;
  title: string;
  instructions: string;
  segments: StarExerciseSegment[];
  initialOrder: StarSegmentId[];
  correctOrderExplanation: string;
  simulatorHref: string;
};

export const starArrangementExercise: StarArrangementExerciseData = {
  id: "interview-foundations.star-arrangement",
  title: "Arrange a STAR answer",
  instructions:
    "Move the four answer segments into Situation, Task, Action, Result order. Drag the cards or use each card's Move up and Move down buttons.",
  segments: [
    {
      id: "situation",
      label: "Situation",
      correctPosition: 0,
      text: "Our volunteer onboarding took two weeks, and many new helpers dropped out before their first shift.",
      placementHint:
        "This context belongs first because it explains the problem before the listener hears your responsibility.",
    },
    {
      id: "task",
      label: "Task",
      correctPosition: 1,
      text: "I was asked to shorten onboarding to one week without removing required safety training.",
      placementHint:
        "This responsibility follows the context so the listener knows exactly what you were accountable for.",
    },
    {
      id: "action",
      label: "Action",
      correctPosition: 2,
      text: "I mapped the delays, combined duplicate forms, and introduced a single guided orientation session.",
      placementHint:
        "These decisions belong after the task because they show how you addressed the responsibility you owned.",
    },
    {
      id: "result",
      label: "Result",
      correctPosition: 3,
      text: "Onboarding fell to five days, and first-shift attendance increased from 68% to 90%.",
      placementHint:
        "This evidence belongs last because it closes the story with the change created by your actions.",
    },
  ],
  initialOrder: ["action", "situation", "result", "task"],
  correctOrderExplanation:
    "Situation establishes the challenge, Task clarifies your responsibility, Action shows what you did, and Result proves what changed. That sequence gives the listener context before evidence and cause before effect.",
  simulatorHref: "/practice",
};
