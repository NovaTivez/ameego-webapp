export type CourseLessonSummary = {
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  objective: string;
  summary: string;
  featured?: boolean;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  featuredLessonId: string;
  lessons: CourseLessonSummary[];
};

export type StarStep = {
  letter: "S" | "T" | "A" | "R";
  name: "Situation" | "Task" | "Action" | "Result";
  explanation: string;
  prompt: string;
};

export type StarLessonContent = CourseLessonSummary & {
  introduction: string;
  steps: StarStep[];
  weakResponse: string;
  strongResponse: string;
  whyStrongIsBetter: string[];
  summaryPoints: string[];
  exerciseHref: string;
};

export const starMethodLesson: StarLessonContent = {
  id: "interview-foundations.star-method",
  slug: "star-method",
  title: "The STAR Method: Build Answers That Land",
  durationMinutes: 8,
  objective:
    "Structure one behavioral interview answer so the listener can follow the challenge, your responsibility, your decisions, and the outcome.",
  summary:
    "Learn a practical four-part structure for turning real experience into a focused interview story.",
  featured: true,
  introduction:
    "STAR is a simple structure for behavioral interview answers. It keeps your story focused while making your individual contribution and evidence easy to understand.",
  steps: [
    {
      letter: "S",
      name: "Situation",
      explanation:
        "Set the scene with only the context the listener needs: where you were, what was happening, and why it mattered.",
      prompt: "What challenge or moment gives this story context?",
    },
    {
      letter: "T",
      name: "Task",
      explanation:
        "Name the specific responsibility, goal, or constraint you owned. Separate your role from the team's general work.",
      prompt: "What were you personally accountable for?",
    },
    {
      letter: "A",
      name: "Action",
      explanation:
        "Explain the decisions and steps you took. Use clear “I” statements and focus on choices that affected the outcome.",
      prompt: "What did you decide, do, or change?",
    },
    {
      letter: "R",
      name: "Result",
      explanation:
        "Close with the outcome. Use measurable evidence when possible, then add what you learned if it strengthens the answer.",
      prompt: "What changed because of your actions?",
    },
  ],
  weakResponse:
    "At my last job, our launch was behind schedule. I helped the team, worked really hard, and we finished it successfully.",
  strongResponse:
    "Two weeks before a product launch, our QA backlog put the release at risk. I was responsible for getting the critical checkout flow ready without reducing test coverage. I triaged defects with QA, created a daily owner board, and paired with engineering on the three blockers. We cleared the critical backlog in eight days, launched on schedule, and reduced reopened defects by 30%.",
  whyStrongIsBetter: [
    "It gives enough context to understand the stakes without a long backstory.",
    "It names the speaker's responsibility instead of hiding behind “we.”",
    "It describes concrete decisions and actions rather than effort alone.",
    "It closes with specific, measurable evidence of the outcome.",
  ],
  summaryPoints: [
    "Keep Situation and Task brief so there is room for Action and Result.",
    "Use “I” to make your contribution clear while still crediting the team.",
    "Choose evidence that proves what changed, not just that the work ended.",
  ],
  exerciseHref: "/learn/star-method/exercise",
};

export const interviewFoundationsCourse: Course = {
  id: "interview-foundations",
  title: "Interview Foundations",
  description:
    "Build the core communication patterns behind clear, credible behavioral interview answers.",
  featuredLessonId: starMethodLesson.id,
  lessons: [starMethodLesson],
};
