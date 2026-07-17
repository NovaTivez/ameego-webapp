import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InterviewSimulator,
  shouldKeepCameraActive,
} from "@/components/InterviewSimulator";
import { INTERVIEW_ATTEMPTS_STORAGE_KEY } from "@/lib/interview/attempts";
import { saveOnboardingPreferences } from "@/lib/onboarding";

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

async function selectResponseMode(
  user: ReturnType<typeof userEvent.setup>,
  mode: "text" | "microphone",
) {
  await user.click(
    screen.getByRole("button", {
      name: mode === "text" ? /text response/i : /microphone response/i,
    }),
  );
  await user.click(screen.getByRole("button", { name: /continue to interview/i }));
}

async function completeTextInterview(user: ReturnType<typeof userEvent.setup>) {
  await selectResponseMode(user, "text");
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

  it("keeps the camera stream active while preview ownership hands off to an interview", () => {
    expect(shouldKeepCameraActive(false, true, false)).toBe(true);
    expect(shouldKeepCameraActive(false, false, true)).toBe(true);
    expect(shouldKeepCameraActive(true, false, false)).toBe(true);
    expect(shouldKeepCameraActive(false, false, false)).toBe(false);
  });

  it("renders the RPG setup controls, progress tracker, and live summary", async () => {
    const user = userEvent.setup();
    render(<InterviewSimulator />);

    expect(screen.getByRole("heading", { name: "Interview Setup" })).toBeVisible();
    expect(screen.getByLabelText(/interview type/i)).toHaveValue("job");
    expect(screen.getByLabelText("Beginner")).toBeChecked();
    expect(screen.getByLabelText("3 questions")).toBeChecked();
    expect(screen.getByRole("heading", { name: /session summary/i })).toBeVisible();
    expect(
      screen.getByRole("list", { name: /interview preparation steps/i }),
    ).toBeVisible();

    await user.click(screen.getByLabelText("Intermediate"));
    await user.click(screen.getByLabelText("5 questions"));

    expect(screen.getByLabelText("Intermediate")).toBeChecked();
    expect(screen.getByLabelText("5 questions")).toBeChecked();
    expect(screen.getAllByText("Intermediate")).toHaveLength(2);
    const summary = screen.getByRole("complementary", { name: /session summary/i });
    expect(within(summary).getByText("Standard session")).toBeVisible();
    expect(within(summary).getByText("5")).toBeVisible();
    expect(screen.getByRole("button", { name: /continue to resume/i })).toHaveClass(
      "pixel-button-primary",
    );
  });

  it("prefills the early interview experience from completed onboarding", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("SpeechRecognition", class {});
    saveOnboardingPreferences(window.localStorage, {
      learningGoal: "interview_skills",
      experienceLevel: "some_practice",
      practiceMode: "microphone",
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
    render(<InterviewSimulator />);

    await waitFor(() => expect(screen.getByLabelText("Intermediate")).toBeChecked());
    expect(
      screen.getByRole("textbox", { name: /practice goals.*optional/i }),
    ).toHaveValue("Build clear STAR stories for interviews.");

    await reachModeWithoutResume(user);
    expect(screen.getByRole("button", { name: /microphone response/i })).toHaveAttribute(
      "aria-pressed",
      "true",
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
    expect(screen.getAllByText("Frontend intern")).toHaveLength(2);
    expect(screen.getAllByText("Northstar Labs")).toHaveLength(2);
    expect(screen.getByText("Start Interview")).toBeVisible();
    expect(
      screen.getByRole("button", { name: /confirm and generate questions/i }),
    ).toHaveClass("pixel-button-primary");
  });

  it("ignores rapid duplicate question-generation clicks and aborts on unmount", async () => {
    const user = userEvent.setup();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      return new Promise<Response>(() => {});
    });
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(<InterviewSimulator />);

    await completeRequiredSetup(user);
    await user.click(screen.getByRole("button", { name: /continue without resume/i }));
    const startButton = screen.getByRole("button", {
      name: /confirm and generate questions/i,
    });
    fireEvent.click(startButton);
    fireEvent.click(startButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    unmount();
    expect(requestSignal?.aborted).toBe(true);
  });

  it("ignores rapid duplicate resume-extraction clicks", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    render(<InterviewSimulator />);

    await completeRequiredSetup(user);
    const file = new File(["resume text"], "resume.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText(/resume file/i), file);
    const extractButton = screen.getByRole("button", { name: /extract resume/i });
    fireEvent.click(extractButton);
    fireEvent.click(extractButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
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
    await selectResponseMode(user, "text");
    expect(await screen.findByLabelText(/interview simulation/i)).toBeVisible();
    expect(screen.getByText(/preview off/i)).toBeVisible();
    expect(screen.getByText(/optional on-device framing reminders only/i)).toBeVisible();
    expect(screen.getByText(/^Camera$/i).parentElement).toHaveTextContent(/Off/i);
    expect(
      screen.queryByText(/\bconfidence\b|\bnervousness\b|\bemployability\b/i),
    ).not.toBeInTheDocument();

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
        name: /turn your completed interview into a learning plan/i,
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /view feedback report/i })).toHaveAttribute(
      "href",
      "#feedback-report",
    );
    expect(
      screen.getByRole("button", { name: /start another interview/i }),
    ).toBeVisible();
    const stored = window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);
    expect(stored).toContain("Confirmed answer number 3");
    expect(stored).not.toMatch(/confidence|nervousness|eye.contact/i);
  }, 15_000);

  it("ignores rapid duplicate feedback-evaluation clicks", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/interview/questions") {
        return Promise.resolve(
          new Response(JSON.stringify({ source: "ai", questions: generatedQuestions }), {
            status: 200,
          }),
        );
      }
      return new Promise<Response>(() => {});
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<InterviewSimulator />);

    await reachModeWithoutResume(user);
    await completeTextInterview(user);
    const evaluateButton = screen.getByRole("button", {
      name: /generate intelligent feedback/i,
    });
    fireEvent.click(evaluateButton);
    fireEvent.click(evaluateButton);

    await waitFor(() => {
      const evaluationCalls = fetchMock.mock.calls.filter(
        ([input]) => String(input) === "/api/interview/evaluate",
      );
      expect(evaluationCalls).toHaveLength(1);
    });
  }, 15_000);

  it("presents the immersive mode-selection scene before starting a response mode", async () => {
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

    expect(
      screen.getByRole("heading", { name: /welcome to your interview/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: /ameego interview coach seated/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("list", { name: /interview preparation steps/i }),
    ).toHaveTextContent(/setup.*resume.*review.*mode selection.*interview/i);

    const continueButton = screen.getByRole("button", {
      name: /continue to interview/i,
    });
    const textCard = screen.getByRole("button", { name: /text response/i });
    expect(continueButton).toBeDisabled();
    expect(textCard).toHaveAttribute("aria-pressed", "false");

    await user.click(textCard);
    expect(textCard).toHaveAttribute("aria-pressed", "true");
    expect(continueButton).toBeEnabled();
    expect(screen.queryByLabelText(/interview simulation/i)).not.toBeInTheDocument();

    await user.click(continueButton);
    expect(await screen.findByLabelText(/interview simulation/i)).toBeVisible();
  });

  it("traps focus in the camera preview and restores the mode trigger on close", async () => {
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
    await user.click(screen.getByLabelText(/optional camera preview/i));
    const continueButton = screen.getByRole("button", { name: /continue to interview/i });
    await user.click(continueButton);

    const dialog = await screen.findByRole("dialog", {
      name: /ready for your interview/i,
    });
    const buttons = within(dialog)
      .getAllByRole("button")
      .filter((button) => !button.hasAttribute("disabled"));
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];
    expect(firstButton).toHaveFocus();

    lastButton.focus();
    await user.tab();
    expect(firstButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(lastButton).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("dialog", { name: /ready for your interview/i }),
    ).toBeNull();
    expect(continueButton).toHaveFocus();
  });

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
    await selectResponseMode(user, "text");

    const simulator = await screen.findByLabelText(/interview simulation/i);
    expect(within(simulator).getByText("Question")).toBeVisible();
    expect(within(simulator).getByText("Timer")).toBeVisible();
    expect(
      within(simulator).getByRole("progressbar", { name: "Learning Progress" }),
    ).toHaveAttribute("aria-valuenow", "1");
    expect(within(simulator).getByLabelText(/pixel interview room/i)).toBeVisible();
    expect(
      within(simulator).getByRole("img", {
        name: /ameego interview coach seated behind a wooden desk/i,
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

    const nextAction = within(simulator).getByRole("button", {
      name: /next: review response/i,
    });
    const endAction = within(simulator).getByRole("button", {
      name: /end interview without saving a completed attempt/i,
    });
    const inactiveMic = within(simulator).getByRole("button", {
      name: /microphone unavailable in text mode/i,
    });
    expect(inactiveMic).toHaveAttribute("data-mic-state", "off");
    expect(within(simulator).getByText("Microphone off")).toBeVisible();
    expect(
      nextAction.compareDocumentPosition(endAction) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(endAction);

    const endDialog = await screen.findByRole("dialog", {
      name: /end this interview/i,
    });
    expect(within(endDialog).getByText(/current draft will not be saved/i)).toBeVisible();
    expect(
      within(endDialog).getByRole("button", { name: /continue interview/i }),
    ).toHaveFocus();
    expect(within(simulator).getByText(/session analysis/i)).toBeVisible();

    await user.click(
      within(endDialog).getByRole("button", { name: /continue interview/i }),
    );
    expect(screen.queryByRole("dialog", { name: /end this interview/i })).toBeNull();
    expect(endAction).toHaveFocus();

    await user.click(endAction);
    await user.click(
      within(
        await screen.findByRole("dialog", { name: /end this interview/i }),
      ).getByRole("button", { name: /^end interview$/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /how would you like to answer/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /continue or start clean/i }),
    ).toBeVisible();
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBeNull();
  });

  it("resumes a paused interview at its current question with confirmed responses intact", async () => {
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
    await selectResponseMode(user, "text");
    await user.type(
      await screen.findByLabelText(/your response/i),
      "Confirmed answer one.",
    );
    await user.click(screen.getByRole("button", { name: /review response/i }));
    await user.click(screen.getByRole("button", { name: /confirm and continue/i }));
    expect(
      await screen.findByRole("heading", { name: generatedQuestions[1].text }),
    ).toBeVisible();

    await user.type(screen.getByLabelText(/your response/i), "Unfinished second answer.");
    await user.click(
      screen.getByRole("button", {
        name: /end interview without saving a completed attempt/i,
      }),
    );
    await user.click(
      within(
        await screen.findByRole("dialog", { name: /end this interview/i }),
      ).getByRole("button", { name: /^end interview$/i }),
    );

    expect(
      screen.getByText(/1 confirmed response will be ready to resume at question 2/i),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: /resume interview/i }));

    const simulator = await screen.findByLabelText(/interview simulation/i);
    expect(
      within(simulator).getByRole("heading", { name: generatedQuestions[1].text }),
    ).toBeVisible();
    expect(within(simulator).getByLabelText(/your response/i)).toHaveValue("");
    expect(
      within(simulator).getByRole("progressbar", { name: "Learning Progress" }),
    ).toHaveAttribute("aria-valuenow", "2");
  });

  it("discards a paused interview and restarts the prepared scenario at Question 1", async () => {
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
    await selectResponseMode(user, "text");
    await user.type(
      await screen.findByLabelText(/your response/i),
      "Confirmed answer one.",
    );
    await user.click(screen.getByRole("button", { name: /review response/i }));
    await user.click(screen.getByRole("button", { name: /confirm and continue/i }));
    expect(
      await screen.findByRole("heading", { name: generatedQuestions[1].text }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: /end interview without saving a completed attempt/i,
      }),
    );
    await user.click(
      within(
        await screen.findByRole("dialog", { name: /end this interview/i }),
      ).getByRole("button", { name: /^end interview$/i }),
    );
    await user.click(screen.getByRole("button", { name: /discard and start over/i }));

    expect(
      screen.queryByRole("heading", { name: /continue or start clean/i }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: /continue to interview/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /text response/i }));
    await user.click(screen.getByRole("button", { name: /continue to interview/i }));

    const simulator = await screen.findByLabelText(/interview simulation/i);
    expect(
      within(simulator).getByRole("heading", { name: generatedQuestions[0].text }),
    ).toBeVisible();
    expect(within(simulator).getByLabelText(/your response/i)).toHaveValue("");
    expect(
      within(simulator).getByRole("progressbar", { name: "Learning Progress" }),
    ).toHaveAttribute("aria-valuenow", "1");
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
      await selectResponseMode(user, "text");

      const cameraDialog = await screen.findByRole("dialog", {
        name: /ready for your interview/i,
      });
      expect(
        within(cameraDialog).getByLabelText(/live mirrored camera readiness preview/i),
      ).toBeInTheDocument();
      expect(
        await within(cameraDialog).findByText(/camera permission was denied/i),
      ).toBeVisible();
      await user.click(within(cameraDialog).getByRole("button", { name: /i'm ready/i }));

      const simulator = await screen.findByLabelText(/interview simulation/i);
      expect(
        await within(simulator).findByText(/camera permission was denied/i),
      ).toBeVisible();
      expect(
        within(simulator).getByRole("button", { name: /retry camera/i }),
      ).toBeVisible();
      expect(within(simulator).getByLabelText(/your response/i)).toBeEnabled();
      await user.type(within(simulator).getByLabelText(/your response/i), "Still works.");
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

  it("keeps microphone mode unavailable before entry when speech recognition is unsupported", async () => {
    const user = userEvent.setup();
    const previousMediaDevices = navigator.mediaDevices;
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
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

      expect(screen.getByRole("button", { name: /microphone response/i })).toBeDisabled();
      expect(
        screen.getByText(/speech recognition is unavailable in this browser/i),
      ).toBeVisible();
      expect(screen.getByRole("button", { name: /text response/i })).toBeEnabled();
      expect(
        screen.getByRole("button", { name: /continue to interview/i }),
      ).toBeDisabled();
      expect(getUserMedia).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: previousMediaDevices,
      });
    }
  });

  it("keeps text mode available when microphone capture is unavailable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("SpeechRecognition", class {});
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

    expect(screen.getByRole("button", { name: /microphone response/i })).toBeDisabled();
    expect(
      screen.getByText(/microphone capture is unavailable in this browser/i),
    ).toBeVisible();
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
      await selectResponseMode(user, "microphone");

      const simulator = await screen.findByLabelText(/interview simulation/i);
      expect(within(simulator).getByText(/mic ready/i)).toBeVisible();
      const startMic = within(simulator).getByRole("button", {
        name: /start microphone/i,
      });
      expect(startMic).toHaveAttribute("data-mic-state", "off");
      await user.click(startMic);

      const recognition = instances[0];
      expect(recognition).toBeDefined();
      expect(recognition.start).toHaveBeenCalled();
      expect(within(simulator).getByText(/listening/i)).toBeVisible();
      expect(
        within(simulator).getByRole("button", { name: /stop microphone/i }),
      ).toHaveAttribute("data-mic-state", "active");
      expect(within(simulator).getByText("Microphone active")).toBeVisible();

      recognition.onresult?.({
        resultIndex: 0,
        results: [
          { isFinal: false, 0: { transcript: "working on" } },
          { isFinal: true, 0: { transcript: "Working on the launch." } },
        ],
      });

      expect(await within(simulator).findByLabelText(/editable transcript/i)).toHaveValue(
        "Working on the launch.",
      );
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
      await screen.findByRole("heading", { name: /feedback report/i }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /overall score/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /star evaluation/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /ai feedback/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /actionable tips/i })).toBeVisible();
    const report = screen.getByRole("heading", { name: /feedback report/i });
    const finalAction = screen.getByRole("button", { name: /start another interview/i });
    expect(
      report.compareDocumentPosition(finalAction) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
      screen.queryByRole("heading", { name: /^feedback report$/i }),
    ).not.toBeInTheDocument();
  }, 15_000);
});
