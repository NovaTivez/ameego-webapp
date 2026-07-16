import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InterviewSimulator } from "@/components/InterviewSimulator";
import { INTERVIEW_ATTEMPTS_STORAGE_KEY } from "@/lib/interview/attempts";

const generatedQuestions = [
  {
    id: "q1",
    category: "introductory",
    text: "Tell us why the frontend internship interests you.",
  },
  {
    id: "q2",
    category: "behavioral",
    text: "Describe a time you solved a difficult team problem.",
  },
  {
    id: "q3",
    category: "role_specific",
    text: "How would you make a new interface accessible?",
  },
];

const validEvaluation = {
  summary: "The responses show clear actions and need a more specific result.",
  strengths: ["The learner confirms a relevant response."],
  improvements: ["Make the final outcome more specific."],
  rubricScores: ["situation", "task", "action", "result"].map((criterion, index) => ({
    criterion,
    score: index === 3 ? 3 : 4,
    explanation: `The ${criterion} is supported by the confirmed transcript.`,
    evidence: `Confirmed answer number ${(index % 3) + 1}.`,
    improvementAction: `Make the ${criterion} more specific in the retry.`,
  })),
  recommendedLessonId: "interview-foundations.star-method",
  nextPracticeAction: "Retry the same scenario with one concrete Result sentence.",
  improvedExample:
    "Confirmed answer number 1. Confirmed answer number 2. Confirmed answer number 3.",
};

async function completeRequiredSetup(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/position or role/i), "Frontend intern");
  await user.type(screen.getByLabelText(/organization or company/i), "Northstar Labs");
  await user.click(screen.getByRole("button", { name: /continue to resume/i }));
}

async function reachModeWithoutResume(user: ReturnType<typeof userEvent.setup>) {
  await completeRequiredSetup(user);
  await user.click(screen.getByRole("button", { name: /continue without resume/i }));
  await user.click(
    screen.getByRole("button", { name: /confirm and generate questions/i }),
  );
  await screen.findByRole("heading", { name: /how would you like to answer/i });
}

async function completeTextInterview(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /text response/i }));
  for (const [index] of generatedQuestions.entries()) {
    await user.type(
      await screen.findByLabelText(/your response/i),
      `Confirmed answer number ${index + 1}.`,
    );
    await user.click(screen.getByRole("button", { name: /review response/i }));
    await user.click(
      screen.getByRole("button", {
        name:
          index === generatedQuestions.length - 1
            ? /confirm and save attempt/i
            : /confirm and continue/i,
      }),
    );
  }
  await screen.findByText("Attempt saved");
}

describe("InterviewSimulator", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders compact setup controls and updates difficulty and length", async () => {
    const user = userEvent.setup();
    render(<InterviewSimulator />);

    expect(screen.getByRole("heading", { name: "Interview Setup" })).toBeVisible();
    expect(screen.getByLabelText(/interview type/i)).toHaveValue("job");
    expect(screen.getByText("Beginner")).toBeVisible();
    expect(screen.getByText("3 questions")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /next difficulty/i }));
    await user.click(screen.getByRole("button", { name: /more interview questions/i }));

    expect(screen.getByText("Intermediate")).toBeVisible();
    expect(screen.getByText("5 questions")).toBeVisible();
    expect(screen.getByRole("button", { name: /continue to resume/i })).toHaveClass(
      "pixel-button-primary",
    );
  });

  it("shows uploaded-file preview and remove actions without changing extraction", async () => {
    const user = userEvent.setup();
    const originalCreateObjectUrl = URL.createObjectURL;
    const originalRevokeObjectUrl = URL.revokeObjectURL;
    const createObjectUrl = vi.fn(() => "blob:resume-preview");
    const revokeObjectUrl = vi.fn();
    URL.createObjectURL = createObjectUrl;
    URL.revokeObjectURL = revokeObjectUrl;
    const openPreview = vi.spyOn(window, "open").mockReturnValue(null);

    try {
      render(<InterviewSimulator />);
      await completeRequiredSetup(user);

      const file = new File(["resume text"], "resume.txt", { type: "text/plain" });
      await user.upload(screen.getByLabelText(/resume file/i), file);

      expect(screen.getByLabelText(/uploaded resume file/i)).toHaveTextContent(
        "resume.txt",
      );
      await user.click(
        screen.getByRole("button", { name: /preview selected resume file/i }),
      );
      expect(createObjectUrl).toHaveBeenCalledWith(file);
      expect(openPreview).toHaveBeenCalledWith(
        "blob:resume-preview",
        "_blank",
        "noopener,noreferrer",
      );

      await user.click(
        screen.getByRole("button", { name: /remove selected resume file/i }),
      );
      expect(screen.queryByLabelText(/uploaded resume file/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/resume file/i)).toHaveValue("");
    } finally {
      URL.createObjectURL = originalCreateObjectUrl;
      URL.revokeObjectURL = originalRevokeObjectUrl;
    }
  });

  it("separates interview details and resume summary before starting", async () => {
    const user = userEvent.setup();
    render(<InterviewSimulator />);

    await completeRequiredSetup(user);
    await user.click(screen.getByRole("button", { name: /continue without resume/i }));

    expect(screen.getByRole("heading", { name: "Review Your Profile" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Interview Details" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Resume Summary" })).toBeVisible();
    expect(screen.getByText("Frontend intern")).toBeVisible();
    expect(screen.getByText("Northstar Labs")).toBeVisible();
    expect(screen.getByText("Start Interview")).toBeVisible();
    expect(
      screen.getByRole("button", { name: /confirm and generate questions/i }),
    ).toHaveClass("pixel-button-primary");
  });

  it("supports the complete no-resume text flow, progression, confirmation, and saving", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ source: "ai", questions: generatedQuestions }), {
            status: 200,
          }),
      ),
    );
    render(<InterviewSimulator />);

    await reachModeWithoutResume(user);
    expect(screen.getByText(/your personalized interview is ready/i)).toBeVisible();
    expect(screen.getByLabelText(/optional camera/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /text response/i }));
    expect(await screen.findByLabelText(/interview simulation/i)).toBeVisible();
    expect(screen.getByText(/preview off/i)).toBeVisible();
    expect(
      screen.getByText(/optional on-device framing reminders only/i),
    ).toBeVisible();
    expect(screen.getByText(/^Camera$/i).parentElement).toHaveTextContent(/Off/i);
    expect(screen.queryByText(/\bconfidence\b|\bnervousness\b|\bemployability\b/i)).not.toBeInTheDocument();

    for (const [index, question] of generatedQuestions.entries()) {
      expect(await screen.findByRole("heading", { name: question.text })).toBeVisible();
      const response = screen.getByLabelText(/your response/i);
      await user.type(response, `Confirmed answer number ${index + 1}.`);
      await user.click(screen.getByRole("button", { name: /review response/i }));
      expect(screen.getByLabelText(/review and edit your transcript/i)).toHaveValue(
        `Confirmed answer number ${index + 1}.`,
      );
      await user.click(
        screen.getByRole("button", {
          name:
            index === generatedQuestions.length - 1
              ? /confirm and save attempt/i
              : /confirm and continue/i,
        }),
      );
    }

    expect(await screen.findByText("Attempt saved")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /intelligent feedback is ready to prepare/i,
      }),
    ).toBeVisible();
    const stored = window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);
    expect(stored).toContain("Confirmed answer number 3");
    expect(stored).not.toMatch(/confidence|nervousness|eye.contact/i);
  }, 15_000);

  it("shows the panel-9 learning HUD, calculated indicators, and a non-saving End action", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ source: "ai", questions: generatedQuestions }), {
            status: 200,
          }),
      ),
    );
    render(<InterviewSimulator />);

    await reachModeWithoutResume(user);
    await user.click(screen.getByRole("button", { name: /text response/i }));

    const simulator = await screen.findByLabelText(/interview simulation/i);
    expect(within(simulator).getByText("Question")).toBeVisible();
    expect(within(simulator).getByText("Timer")).toBeVisible();
    expect(
      within(simulator).getByRole("progressbar", { name: "Learning Progress" }),
    ).toHaveAttribute("aria-valuenow", "1");
    expect(within(simulator).getByLabelText(/pixel interview room/i)).toBeVisible();
    expect(
      within(simulator).getByRole("img", {
        name: /jordan.*neutral pixel-art interviewer/i,
      }),
    ).toBeVisible();
    expect(
      within(simulator).getByRole("heading", { name: /session analysis/i }),
    ).toBeVisible();

    const transcript = within(simulator).getByLabelText(/your response/i);
    await user.type(transcript, "Um, I clarified the task and, you know, documented it.");
    const fillerRow = within(simulator).getByText(
      /filler words \(draft scan\)/i,
    ).parentElement;
    const recordedRow = within(simulator).getByText(/response recorded/i).parentElement;
    const durationRow = within(simulator).getByText(/speaking duration/i).parentElement;
    expect(fillerRow).not.toBeNull();
    expect(recordedRow).not.toBeNull();
    expect(durationRow).not.toBeNull();
    expect(within(fillerRow as HTMLElement).getByText("2")).toBeVisible();
    expect(within(recordedRow as HTMLElement).getByText("Draft captured")).toBeVisible();
    expect(within(durationRow as HTMLElement).getByText("Text mode")).toBeVisible();
    expect(within(simulator).queryByText(/confidence|nerves|employability/i)).toBeNull();

    await user.click(
      within(simulator).getByRole("button", {
        name: /end interview without saving a completed attempt/i,
      }),
    );

    expect(
      await screen.findByRole("heading", { name: /how would you like to answer/i }),
    ).toBeVisible();
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBeNull();
  });

  it("keeps the interview usable when camera permission is denied", async () => {
    const user = userEvent.setup();
    const previousMediaDevices = navigator.mediaDevices;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ source: "ai", questions: generatedQuestions }), {
            status: 200,
          }),
      ),
    );
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        }),
      },
    });

    try {
      render(<InterviewSimulator />);
      await reachModeWithoutResume(user);
      await user.click(screen.getByLabelText(/optional camera/i));
      await user.click(screen.getByRole("button", { name: /text response/i }));

      const simulator = await screen.findByLabelText(/interview simulation/i);
      expect(
        await within(simulator).findByText(/camera permission was denied/i),
      ).toBeVisible();
      expect(
        within(simulator).getByRole("button", { name: /retry camera/i }),
      ).toBeVisible();
      expect(within(simulator).getByLabelText(/your response/i)).toBeEnabled();
      await user.type(
        within(simulator).getByLabelText(/your response/i),
        "Still works.",
      );
      await user.click(
        within(simulator).getByRole("button", { name: /review response/i }),
      );
      expect(
        within(simulator).getByLabelText(/review and edit your transcript/i),
      ).toHaveValue("Still works.");
    } finally {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: previousMediaDevices,
      });
    }
  });

  it("shows setup validation before allowing progress", async () => {
    const user = userEvent.setup();
    render(<InterviewSimulator />);

    await user.click(screen.getByRole("button", { name: /continue to resume/i }));

    expect(screen.getByText(/enter a role/i)).toBeVisible();
    expect(screen.getByText(/enter an organization/i)).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: /optional resume/i }),
    ).not.toBeInTheDocument();
  });

  it("offers editable manual resume context after extraction failure", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: "rate_limit_exceeded: provider request failed with status 429",
            }),
            { status: 502 },
          ),
      ),
    );
    render(<InterviewSimulator />);
    await completeRequiredSetup(user);

    const file = new File(["resume text"], "resume.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText(/resume file/i), file);
    await user.click(screen.getByRole("button", { name: /extract resume/i }));
    const resumeAlert = await screen.findByRole("alert");
    expect(resumeAlert).toHaveTextContent(
      /resume personalization is temporarily unavailable/i,
    );
    expect(resumeAlert).not.toHaveTextContent(/rate.limit|provider|429/i);

    await user.type(
      screen.getByLabelText(/manual resume highlights/i),
      "Led a campus accessibility project.",
    );
    await user.click(screen.getByRole("button", { name: /use manual resume text/i }));

    expect(await screen.findByLabelText("Experience")).toHaveValue(
      "Led a campus accessibility project.",
    );
    expect(
      screen.getByRole("button", { name: /remove resume information/i }),
    ).toBeVisible();
  });

  it("uses Ameego language and keeps the standard interview available after personalization failure", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured." }), {
            status: 503,
          }),
      ),
    );
    render(<InterviewSimulator />);
    await completeRequiredSetup(user);
    await user.click(screen.getByRole("button", { name: /continue without resume/i }));
    await user.click(
      screen.getByRole("button", { name: /confirm and generate questions/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be generated/i);
    const personalizationAlert = screen.getByRole("alert");
    expect(personalizationAlert).toHaveTextContent(
      /personalization is temporarily unavailable/i,
    );
    expect(personalizationAlert).not.toHaveTextContent(/openai|api key|gpt|model/i);
    expect(
      within(personalizationAlert).getByRole("button", { name: /retry generation/i }),
    ).toBeVisible();
    await user.click(
      within(personalizationAlert).getByRole("button", {
        name: /continue with standard interview/i,
      }),
    );
    const fallbackNotice = await screen.findByRole("status");
    expect(fallbackNotice).toHaveTextContent(/standard interview questions selected/i);
    expect(fallbackNotice).not.toHaveTextContent(/ai|gpt|model/i);
  });

  it("keeps text mode available when microphone permission is unavailable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ source: "ai", questions: generatedQuestions }), {
            status: 200,
          }),
      ),
    );
    render(<InterviewSimulator />);
    await reachModeWithoutResume(user);

    await user.click(screen.getByRole("button", { name: /microphone response/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /microphone access is unavailable/i,
    );
    expect(screen.getByRole("button", { name: /text response/i })).toBeVisible();
  });

  it("shows live listening status and commits speech finals into the editable transcript", async () => {
    const user = userEvent.setup();
    type Handler = ((event: unknown) => void) | null;
    const instances: Array<{
      onresult: Handler;
      onerror: Handler;
      onend: Handler;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
    }> = [];

    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onresult: Handler = null;
      onerror: Handler = null;
      onend: Handler = null;
      start = vi.fn();
      stop = vi.fn();

      constructor() {
        instances.push(this);
      }
    }

    const previousMediaDevices = navigator.mediaDevices;
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockSpeechRecognition,
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => ({
          getTracks: () => [{ stop: vi.fn() }],
        })),
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ source: "ai", questions: generatedQuestions }), {
            status: 200,
          }),
      ),
    );

    try {
      render(<InterviewSimulator />);
      await reachModeWithoutResume(user);
      await user.click(screen.getByRole("button", { name: /microphone response/i }));

      const simulator = await screen.findByLabelText(/interview simulation/i);
      expect(within(simulator).getByText(/mic ready/i)).toBeVisible();
      await user.click(
        within(simulator).getByRole("button", { name: /start microphone/i }),
      );

      const recognition = instances[0];
      expect(recognition).toBeDefined();
      expect(recognition.start).toHaveBeenCalled();
      expect(within(simulator).getByText(/listening/i)).toBeVisible();

      recognition.onresult?.({
        resultIndex: 0,
        results: [
          { isFinal: false, 0: { transcript: "working on" } },
          { isFinal: true, 0: { transcript: "Working on the launch." } },
        ],
      });

      expect(
        await within(simulator).findByLabelText(/editable transcript/i),
      ).toHaveValue("Working on the launch.");
      expect(within(simulator).getByText(/listening… working on/i)).toBeVisible();
    } finally {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: previousMediaDevices,
      });
      Reflect.deleteProperty(window, "SpeechRecognition");
    }
  });

  it("preserves the scenario, questions, and focused goal when retrying a valid report", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        return url.includes("/evaluate")
          ? new Response(JSON.stringify(validEvaluation), { status: 200 })
          : new Response(
              JSON.stringify({ source: "ai", questions: generatedQuestions }),
              {
                status: 200,
              },
            );
      }),
    );
    render(<InterviewSimulator />);
    await reachModeWithoutResume(user);
    await completeTextInterview(user);

    await user.click(
      screen.getByRole("button", { name: /generate intelligent feedback/i }),
    );
    expect(
      await screen.findByRole("heading", { name: /STAR communication review/i }),
    ).toBeVisible();
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toContain(
      '"evaluation"',
    );
    await user.click(screen.getByRole("button", { name: /retry this simulation/i }));

    expect(
      await screen.findByRole("heading", { name: /your goal for this attempt/i }),
    ).toBeVisible();
    expect(screen.getByText(validEvaluation.nextPracticeAction)).toBeVisible();
    expect(screen.getByText(/Frontend intern at Northstar Labs/i)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /how would you like to answer/i }),
    ).toBeVisible();
  }, 15_000);

  it("shows a retryable API failure state without displaying unvalidated feedback", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        return url.includes("/evaluate")
          ? new Response(
              JSON.stringify({
                error: "rate_limit_exceeded: OpenAI returned status 429",
                code: "provider",
              }),
              {
                status: 503,
              },
            )
          : new Response(
              JSON.stringify({ source: "ai", questions: generatedQuestions }),
              {
                status: 200,
              },
            );
      }),
    );
    render(<InterviewSimulator />);
    await reachModeWithoutResume(user);
    await completeTextInterview(user);

    await user.click(
      screen.getByRole("button", { name: /generate intelligent feedback/i }),
    );
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/service temporarily unavailable/i);
    expect(alert).toHaveTextContent(/intelligent feedback is temporarily unavailable/i);
    expect(alert).not.toHaveTextContent(/openai|rate.limit|provider|429|api|model/i);
    expect(within(alert).getByRole("button", { name: /retry feedback/i })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: /STAR communication review/i }),
    ).not.toBeInTheDocument();
  }, 15_000);
});
