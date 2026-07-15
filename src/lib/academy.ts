export type AcademyLocationState = "available" | "locked";

export type AcademyLocation = {
  id: "interview-center" | "speech-hall" | "progress-library";
  name: string;
  shortLabel: string;
  description: string;
  state: AcademyLocationState;
  href?: string;
  recommended?: boolean;
  comingSoon?: boolean;
};

export const academyLocations: AcademyLocation[] = [
  {
    id: "interview-center",
    name: "Interview Center",
    shortLabel: "Practice wing",
    description:
      "Step into a calm rehearsal room and prepare for structured interview practice.",
    state: "available",
    href: "/practice",
    recommended: true,
  },
  {
    id: "speech-hall",
    name: "Speech Hall",
    shortLabel: "Speaking wing",
    description: "A future space for delivery, pacing, and confident speaking exercises.",
    state: "locked",
    comingSoon: true,
  },
  {
    id: "progress-library",
    name: "Progress Library",
    shortLabel: "Records wing",
    description:
      "Open saved lessons, exercises, interview attempts, and rubric comparisons built only from this device's records.",
    state: "available",
    href: "/progress",
  },
];
