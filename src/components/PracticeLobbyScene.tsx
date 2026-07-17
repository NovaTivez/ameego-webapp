type PracticeLobbySceneProps = {
  stage: "setup" | "resume" | "review" | "mode";
};

const stageLabels = {
  setup: "setup",
  resume: "resume preparation",
  review: "profile review",
  mode: "response-mode selection",
} as const;

export function PracticeLobbyScene({ stage }: PracticeLobbySceneProps) {
  return (
    <section
      className="practice-lobby-scene practice-lobby-panorama"
      aria-label={`Panoramic Interview Center room during ${stageLabels[stage]}`}
    />
  );
}
