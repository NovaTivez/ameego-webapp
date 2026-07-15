# Demo script (under 3 minutes)

Public video outline for Ameego. Target length: **2:30–2:55**. Speak to the screen; do not invent metrics or Codex achievements beyond what is listed here.

Suggested on-screen path: `/` → `/learn/star-method` → `/learn/star-method/exercise` → `/practice` → feedback → `/progress`.

Pre-roll checklist (not on camera):

- `OPENAI_API_KEY` set; one live STAR evaluation already verified in preflight
- Browser storage empty (or reset) so the empty Progress state is honest
- For the comparison beat: either complete two evaluated attempts live (tight timing) **or** have two same-scenario evaluated attempts ready from a rehearsal and open Progress after the second evaluation
- Prefer **text mode** for reliability; mention microphone is optional

---

## 1. The learner problem (~15s)

**Say:**  
“Interview practice usually means vague advice or a score you can’t trust. Learners need a loop: learn a structure, try it, get feedback on their words, then retry.”

**Show:** Academy landing / first viewport.

---

## 2. The Pixel Communication Academy (~15s)

**Say:**  
“Ameego is the Pixel Communication Academy—a campus hub for interview communication practice. Interview Center and Progress Library are live; Speech Hall is honestly locked as coming soon.”

**Show:** Campus map + menu; click into Learn or Interview Center briefly.

---

## 3. The STAR lesson (~20s)

**Say:**  
“In Interview Foundations, the STAR Method lesson teaches Situation, Task, Action, and Result with a clear learning objective—not a personality score.”

**Show:** `/learn/star-method`; scroll one section; click Mark lesson complete.

---

## 4. The interactive exercise (~20s)

**Say:**  
“Then an interactive exercise: reorder a shuffled answer. You can drag, or use Move up and Move down from the keyboard. Checking the order saves progress on this device.”

**Show:** Reorder one segment; Check my order; continue toward Practice.

---

## 5. The interview simulation (~30s)

**Say:**  
“In the Interview Center, you confirm the role you’re preparing for. Resume upload is optional. GPT-5.6 can generate personalized questions, or you can use clearly labeled general questions if generation fails. Answers are text—or microphone with an editable transcript you must confirm before anything is saved.”

**Show:** Setup → Continue without resume (or quick review) → generate questions → text mode → answer one short STAR-shaped response → review/confirm. If time is tight, cut after confirming the first answer and jump-cut to a completed attempt (still say the full flow exists).

---

## 6. GPT-5.6 feedback (~25s)

**Say:**  
“After the attempt is saved, GPT-5.6 evaluates only the confirmed transcript against STAR. Every score comes with explanation and evidence that must appear in the transcript. It does not judge emotion, honesty, or hireability—and it is not an official grade.”

**Show:** Generate STAR feedback; highlight one criterion’s evidence quote and the disclaimer.

---

## 7. Targeted recommendation and retry (~25s)

**Say:**  
“You get a recommended next lesson—today that’s the STAR Method lesson—and you can retry the same scenario. In the Progress Library, open a past attempt or compare two evaluated runs from the same role. Comparison shows rubric-level changes and remaining practice areas. It never claims overall progress from one isolated score.”

**Show:** Recommended lesson link; Progress Library counts; open or compare view (even briefly).

---

## 8. How Codex accelerated development (~15s)

**Say only what the workflow log supports:**  
“We used Codex to ship the empty repository into a Next.js app, wire the interview simulator and GPT-5.6 evaluation with transcript-evidence checks, build attempt comparison, and run a full release audit with storage and accessibility fixes—recorded in our Codex workflow log.”

**Show (optional):** Brief flash of `docs/CODEX_WORKFLOW.md` headings, or stay on the product UI.

Do **not** claim live evaluation metrics, judge scores, or features that were not shipped.

---

## 9. Important decisions made by the team (~15s)

**Say:**  
“The team kept AI on the server with `store: false`, treated model output as untrusted until evidence checks pass, made speech optional with mandatory transcript confirmation, and scoped feedback as communication practice—not a hiring decision.”

**Show:** Privacy/disclaimer line on the feedback screen, or Decision Log titles.

---

## Closing (~5s)

**Say:**  
“Ameego: learn STAR, practice, get grounded GPT-5.6 feedback, retry, and compare—on this device.”

**Show:** Academy or Progress Library final frame. End.

---

## Timing cheat sheet

| Beat                      | Target    |
| ------------------------- | --------- |
| Problem + Academy         | 0:00–0:30 |
| Lesson + exercise         | 0:30–1:10 |
| Simulator                 | 1:10–1:40 |
| Feedback                  | 1:40–2:05 |
| Recommend / compare       | 2:05–2:30 |
| Codex + decisions + close | 2:30–2:55 |

If over time: skip second full interview on camera; show Progress comparison from a rehearsal, and say both attempts were evaluated with GPT-5.6 in the same scenario.
