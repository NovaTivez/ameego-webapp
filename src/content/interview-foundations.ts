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

export type AcademyExerciseKind =
  "camera" | "checklist" | "choice" | "reflection" | "rewrite" | "simulator" | "speech";

export type AcademyDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type AcademyLesson = {
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  difficulty: AcademyDifficulty;
  xpReward: number;
  objective: string;
  summary: string;
  topics: string[];
  exercise: {
    kind: AcademyExerciseKind;
    title: string;
    instruction: string;
    prompts: string[];
    sample?: string;
  };
  href?: string;
  aiPracticeHref?: string;
};

export type AcademyPhase = {
  id: string;
  number: number;
  title: string;
  goal: string;
  badge: string;
  lessons: AcademyLesson[];
};

export const COURSE_COMPLETION_BONUS_XP = 500;
export const COURSE_COMPLETION_BADGE = "Interview Master";

export const interviewAcademyPhases: AcademyPhase[] = [
  {
    id: "preparing",
    number: 1,
    title: "Preparing for Interviews",
    goal: "Prepare before entering an interview.",
    badge: "Research Rookie",
    lessons: [
      {
        id: "interview-foundations.research-company",
        slug: "research-company",
        title: "Research the Company",
        durationMinutes: 12,
        difficulty: "Beginner",
        xpReward: 50,
        objective:
          "Identify useful company facts and connect them to the role before an interview.",
        summary:
          "Turn public company information into useful talking points and thoughtful questions.",
        topics: [
          "Company mission",
          "Products and services",
          "Recent news",
          "Understanding the job posting",
        ],
        exercise: {
          kind: "reflection",
          title: "Company Intel Quest",
          instruction:
            "Analyze the sample company profile, then record the clues you would use in an interview.",
          prompts: [
            "What problem does the company solve?",
            "Which recent update connects to the role?",
            "What informed question would you ask the interviewer?",
          ],
        },
      },
      {
        id: "interview-foundations.understand-role",
        slug: "understand-role",
        title: "Understand the Job Role",
        durationMinutes: 10,
        difficulty: "Beginner",
        xpReward: 50,
        objective:
          "Separate responsibilities, required skills, and preferred qualifications in a job description.",
        summary:
          "Read a job description strategically so your examples match what the employer needs.",
        topics: ["Responsibilities", "Required skills", "Preferred qualifications"],
        exercise: {
          kind: "checklist",
          title: "Skill Scan",
          instruction:
            "Highlight the required skills in a sample job description and separate them from preferred qualifications.",
          prompts: [
            "Choose the three required skills you can prove with an example.",
            "Identify one preferred qualification you could develop.",
          ],
        },
      },
      {
        id: "interview-foundations.interview-checklist",
        slug: "interview-checklist",
        title: "Interview Checklist",
        durationMinutes: 8,
        difficulty: "Beginner",
        xpReward: 50,
        objective: "Complete a reliable readiness check before interview time.",
        summary:
          "Build a repeatable pre-interview routine that protects your focus when the clock is running.",
        topics: ["Resume", "Camera", "Internet", "Lighting", "Outfit"],
        exercise: {
          kind: "checklist",
          title: "Two-Minute Loadout",
          instruction:
            "Complete the preparation checklist before the practice timer expires.",
          prompts: [
            "Resume and job posting ready",
            "Camera, internet, and audio checked",
            "Lighting and interview outfit checked",
          ],
        },
      },
      {
        id: "interview-foundations.first-impression",
        slug: "first-impression",
        title: "First Impression",
        durationMinutes: 10,
        difficulty: "Beginner",
        xpReward: 50,
        objective:
          "Practice a professional greeting with comfortable posture and camera framing.",
        summary:
          "Practice a calm opening that communicates attention, preparation, and professionalism.",
        topics: ["Greeting", "Smile", "Eye contact", "Professional posture"],
        exercise: {
          kind: "camera",
          title: "Camera Rehearsal",
          instruction:
            "Use the optional on-device preview to check framing, posture, and approximate head orientation.",
          prompts: [
            "Keep your face comfortably inside the frame.",
            "Look toward the camera during your greeting.",
            "Use an upright, comfortable posture.",
          ],
        },
      },
    ],
  },
  {
    id: "answering",
    number: 2,
    title: "Answering Clearly",
    goal: "Improve clear, professional communication.",
    badge: "Clear Communicator",
    lessons: [
      {
        id: "interview-foundations.speaking-clearly",
        slug: "speaking-clearly",
        title: "Speaking Clearly",
        durationMinutes: 10,
        difficulty: "Intermediate",
        xpReward: 75,
        objective:
          "Deliver a short passage at a steady pace with clear wording and fewer filler words.",
        summary:
          "Build awareness of pace, pronunciation, and filler words using a timed read-aloud.",
        topics: ["Speaking pace", "Pronunciation", "Avoiding filler words"],
        exercise: {
          kind: "speech",
          title: "Clarity Read-Aloud",
          instruction:
            "Read the practice paragraph aloud. Browser speech recognition can provide a draft transcript and neutral pace indicators when available.",
          prompts: [
            "Strong communication starts with a clear message, a steady pace, and a brief pause before the most important point.",
          ],
          sample:
            "Strong communication starts with a clear message, a steady pace, and a brief pause before the most important point.",
        },
        aiPracticeHref: "/practice",
      },
      {
        id: "interview-foundations.tell-me-about-yourself",
        slug: "tell-me-about-yourself",
        title: "Tell Me About Yourself",
        durationMinutes: 12,
        difficulty: "Intermediate",
        xpReward: 75,
        objective:
          "Create a focused professional introduction that fits within 60 seconds.",
        summary:
          "Connect your present focus, relevant experience, and reason for pursuing the role.",
        topics: ["Professional structure", "Relevant evidence", "60-second length"],
        exercise: {
          kind: "speech",
          title: "60-Second Introduction",
          instruction:
            "Record or type a concise introduction. Review its structure and length, then use the Interview Center for validated AI feedback.",
          prompts: ["Present focus", "Relevant experience", "Why this opportunity"],
        },
        aiPracticeHref: "/practice",
      },
      {
        id: "interview-foundations.common-questions",
        slug: "common-interview-questions",
        title: "Common Interview Questions",
        durationMinutes: 15,
        difficulty: "Intermediate",
        xpReward: 75,
        objective: "Prepare relevant evidence for four frequently asked questions.",
        summary:
          "Practice strengths, weaknesses, role fit, and company motivation without memorizing a script.",
        topics: [
          "Strengths",
          "Weaknesses",
          "Why should we hire you?",
          "Why this company?",
        ],
        exercise: {
          kind: "simulator",
          title: "Question Practice Run",
          instruction:
            "Choose one question, outline your evidence, then continue to the Interview Center for AI-generated questions and validated feedback.",
          prompts: ["Strengths", "Weaknesses", "Why hire you?", "Why this company?"],
        },
        aiPracticeHref: "/practice",
      },
      {
        id: "interview-foundations.difficult-questions",
        slug: "difficult-questions",
        title: "Difficult Questions",
        durationMinutes: 14,
        difficulty: "Intermediate",
        xpReward: 75,
        objective:
          "Respond to difficult topics honestly while emphasizing responsibility and growth.",
        summary:
          "Practice calm, specific responses about failure, resume gaps, and workplace conflict.",
        topics: ["Failures", "Resume gaps", "Conflict resolution"],
        exercise: {
          kind: "choice",
          title: "Response Strategy",
          instruction:
            "Choose the strongest response approach, then explain how it shows ownership and learning.",
          prompts: [
            "Acknowledge the situation, explain your responsibility, and show what changed.",
            "Avoid the topic and redirect to an unrelated strength.",
            "Blame another person so the interviewer knows it was not your fault.",
          ],
        },
      },
    ],
  },
  {
    id: "star",
    number: 3,
    title: "STAR Method",
    goal: "Turn real experience into a complete behavioral interview story.",
    badge: "STAR Storyteller",
    lessons: [
      {
        id: starMethodLesson.id,
        slug: "star-method",
        title: "STAR Introduction",
        durationMinutes: starMethodLesson.durationMinutes,
        difficulty: "Advanced",
        xpReward: 100,
        objective: starMethodLesson.objective,
        summary: starMethodLesson.summary,
        topics: ["Situation", "Task", "Action", "Result"],
        exercise: {
          kind: "simulator",
          title: "STAR Arrangement",
          instruction:
            "Complete the published STAR lesson, then arrange a response into the correct structure.",
          prompts: ["Study the framework", "Complete the arrangement exercise"],
        },
        href: `/learn/${starMethodLesson.slug}`,
      },
      {
        id: "interview-foundations.situation-task",
        slug: "situation-and-task",
        title: "Situation & Task",
        durationMinutes: 10,
        difficulty: "Advanced",
        xpReward: 100,
        objective:
          "Separate essential context from the responsibility you personally owned.",
        summary:
          "Set the scene briefly, then make your goal or responsibility unmistakable.",
        topics: ["Relevant context", "Personal responsibility", "Concise setup"],
        exercise: {
          kind: "choice",
          title: "Context Sort",
          instruction:
            "Identify which statement describes the Situation and which describes the Task.",
          prompts: [
            "The student organization had two weeks to recover a delayed event launch.",
            "I was responsible for rebuilding the volunteer schedule and confirming owners.",
            "We worked hard and hoped everything would improve.",
          ],
        },
      },
      {
        id: "interview-foundations.action",
        slug: "star-action",
        title: "Action",
        durationMinutes: 10,
        difficulty: "Advanced",
        xpReward: 100,
        objective:
          "Describe your decisions and actions using specific professional language.",
        summary:
          "Replace vague effort statements with concrete choices that show your contribution.",
        topics: ["I-statements", "Decision detail", "Professional verbs"],
        exercise: {
          kind: "rewrite",
          title: "Action Upgrade",
          instruction:
            "Rewrite the weak action so it names specific decisions and steps.",
          prompts: ["I helped the team and worked really hard until it was fixed."],
          sample: "I helped the team and worked really hard until it was fixed.",
        },
      },
      {
        id: "interview-foundations.result",
        slug: "star-result",
        title: "Result",
        durationMinutes: 10,
        difficulty: "Advanced",
        xpReward: 100,
        objective: "Close a story with a measurable outcome and relevant learning.",
        summary:
          "Make the value of your actions visible with evidence instead of vague success.",
        topics: ["Measurable outcomes", "Evidence", "Relevant learning"],
        exercise: {
          kind: "rewrite",
          title: "Result Upgrade",
          instruction:
            "Rewrite the vague result using a measurable outcome or clear evidence.",
          prompts: ["The project went well and everyone was happy."],
          sample: "The project went well and everyone was happy.",
        },
      },
      {
        id: "interview-foundations.complete-star-story",
        slug: "complete-star-story",
        title: "Complete STAR Story",
        durationMinutes: 18,
        difficulty: "Advanced",
        xpReward: 100,
        objective:
          "Draft and deliver a complete behavioral response using all four STAR parts.",
        summary:
          "Bring Situation, Task, Action, and Result together in one focused interview answer.",
        topics: ["Complete structure", "Behavioral evidence", "Focused delivery"],
        exercise: {
          kind: "reflection",
          title: "STAR Story Lab",
          instruction:
            "Answer the behavioral question, then check that every STAR part is represented before requesting AI feedback in the Interview Center.",
          prompts: [
            "Tell me about a time you solved a difficult problem with limited time or resources.",
          ],
        },
        aiPracticeHref: "/practice",
      },
    ],
  },
  {
    id: "delivery",
    number: 4,
    title: "Interview Delivery",
    goal: "Improve professional presentation skills.",
    badge: "Confident Candidate",
    lessons: [
      {
        id: "interview-foundations.voice-speaking",
        slug: "voice-and-speaking",
        title: "Voice & Speaking",
        durationMinutes: 12,
        difficulty: "Advanced",
        xpReward: 100,
        objective: "Practice clear pacing and intentional pauses in a spoken response.",
        summary: "Use neutral timing and transcript indicators to review a read-aloud.",
        topics: ["Pacing", "Clarity", "Intentional pauses"],
        exercise: {
          kind: "speech",
          title: "Voice Checkpoint",
          instruction:
            "Read the paragraph aloud, then review the transcript and pace indicators. No confidence or emotion is inferred.",
          prompts: [
            "I prepared two examples that show how I organize work, communicate with teammates, and learn from feedback.",
          ],
          sample:
            "I prepared two examples that show how I organize work, communicate with teammates, and learn from feedback.",
        },
        aiPracticeHref: "/practice",
      },
      {
        id: "interview-foundations.body-language",
        slug: "body-language",
        title: "Body Language",
        durationMinutes: 12,
        difficulty: "Advanced",
        xpReward: 100,
        objective:
          "Review camera framing, face visibility, and approximate head orientation.",
        summary:
          "Use optional local camera indicators without inferring emotion, personality, or employability.",
        topics: ["Posture setup", "Camera framing", "Approximate orientation"],
        exercise: {
          kind: "camera",
          title: "Framing Rehearsal",
          instruction:
            "Enable the optional on-device preview and practice a greeting while checking neutral framing indicators.",
          prompts: [
            "Face remains comfortably visible",
            "Camera is close to eye level",
            "Posture remains upright and comfortable",
          ],
        },
      },
      {
        id: "interview-foundations.confidence-language",
        slug: "confidence",
        title: "Confidence",
        durationMinutes: 10,
        difficulty: "Advanced",
        xpReward: 100,
        objective:
          "Replace hesitant wording with accurate, direct professional statements.",
        summary:
          "Build credible language by naming your contribution without exaggeration.",
        topics: ["Direct language", "Accurate ownership", "Credible claims"],
        exercise: {
          kind: "rewrite",
          title: "Language Upgrade",
          instruction:
            "Rewrite the hesitant statement so it is direct, specific, and still accurate.",
          prompts: ["I guess I kind of helped with the project when people needed me."],
          sample: "I guess I kind of helped with the project when people needed me.",
        },
      },
      {
        id: "interview-foundations.professional-closing",
        slug: "professional-closing",
        title: "Professional Closing",
        durationMinutes: 15,
        difficulty: "Advanced",
        xpReward: 100,
        objective:
          "Close an interview with thoughtful questions, thanks, and clear interest.",
        summary:
          "End professionally by asking informed questions and thanking the interviewer.",
        topics: ["Questions to ask", "Ending an interview", "Thanking the interviewer"],
        exercise: {
          kind: "reflection",
          title: "Closing Rehearsal",
          instruction:
            "Write or deliver a complete closing with one informed question and a concise thank-you.",
          prompts: ["Your informed question", "Your closing thank-you"],
        },
        aiPracticeHref: "/practice",
      },
    ],
  },
];

export const interviewAcademyLessons = interviewAcademyPhases.flatMap(
  (phase) => phase.lessons,
);

export function getAcademyLessonHref(lesson: AcademyLesson): string {
  return lesson.href ?? `/learn/academy/${lesson.slug}`;
}

export function getAcademyLessonBySlug(slug: string): AcademyLesson | undefined {
  return interviewAcademyLessons.find((lesson) => lesson.slug === slug);
}

export function getAcademyLessonIndex(lessonId: string): number {
  return interviewAcademyLessons.findIndex((lesson) => lesson.id === lessonId);
}
