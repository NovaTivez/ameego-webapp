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

describe("InterviewSimulator", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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
    expect(screen.getByText(/GPT-5.6 personalized questions are ready/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /text response/i }));
    expect(await screen.findByLabelText(/interview simulation/i)).toBeVisible();
    expect(screen.getByText(/preview not enabled/i)).toBeVisible();
    expect(
      screen.getByText(/no face, posture, eye-contact, or emotion data/i),
    ).toBeVisible();

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
    const stored = window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);
    expect(stored).toContain("Confirmed answer number 3");
    expect(stored).not.toMatch(/confidence|nervousness|eye.contact/i);
  }, 15_000);

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
          new Response(JSON.stringify({ error: "Resume extraction failed." }), {
            status: 502,
          }),
      ),
    );
    render(<InterviewSimulator />);
    await completeRequiredSetup(user);

    const file = new File(["resume text"], "resume.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText(/resume file/i), file);
    await user.click(screen.getByRole("button", { name: /extract resume/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/not completed/i);

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

  it("labels and enables the general-question fallback after AI failure", async () => {
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
    await user.click(screen.getByRole("button", { name: /use general questions/i }));
    const fallbackNotice = await screen.findByRole("status");
    expect(fallbackNotice).toHaveTextContent(/general fallback questions selected/i);
    expect(within(fallbackNotice).getByText(/not AI-personalized/i)).toBeVisible();
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
});
