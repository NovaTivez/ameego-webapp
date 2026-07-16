# Hackathon submission checklist

Use this before final submission. Do not check items that are not actually done. Items marked **Human** cannot be completed by Codex alone.

## Category and description

- [ ] **Category selected** — Confirm the official hackathon track/category on the submission form. _(Human; not recorded in this repo.)_
- [ ] **Project description prepared** — Short description matches the README pitch and problem/solution. Copy from README “One-sentence pitch” + one problem sentence if needed.

## Demo video

- [ ] **Demo video recorded** — Public video under three minutes, following [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md).
- [ ] Video includes: learner problem, Academy, STAR lesson, exercise, interview simulation, GPT-5.6 feedback, recommendation/retry/compare beat, Codex acceleration (factual), team decisions.
- [ ] Video does **not** claim fabricated results, offline evaluation, Speech Hall features, or that GPT scores body language / emotion from the camera.

## Repository

- [ ] **Repository URL verified** — Public (or judge-accessible) remote URL matches the submission form.
- [ ] **Repository permissions verified** — Judges can clone/read without private-key blockers; secrets are not in the repo.
- [ ] Git history exists (`git init` / remote push completed if this workspace started without `.git`). _(Human if still missing.)_
- [ ] `.env.local` and real API keys are **not** committed; only `.env.example` ships.

## README and reproducibility

- [ ] **README tested from a clean setup** — On a fresh machine or clean folder: install → copy `.env.example` → set key → `dev` or `build`/`start` → walk Academy → lesson → exercise → practice → evaluate → progress.
- [ ] README sections present: name, pitch, problem, audience, solution, features, educational loop, GPT-5.6 usage, Codex acceleration, stack, architecture, setup, env vars, seed/reset, commands, tests, production build, limitations, privacy, license.
- [ ] Windows note (`npm.cmd`) verified if demoing on Windows.

## License

- [ ] **License included** — Choose a license, fill the empty `LICENSE` file, and update the README License section. _(Human; currently empty.)_

## GPT-5.6 and Codex evidence

- [ ] **GPT-5.6 usage demonstrated** — Live STAR evaluation in the video (or linked clip) with visible transcript-grounded feedback. Preflight: `OPENAI_API_KEY` works for `/api/interview/evaluate`.
- [ ] Personalized questions or resume extraction shown only if they succeed live; otherwise show the **labeled** general-question path honestly.
- [ ] **Codex usage documented** — README “How Codex accelerated development” + [`docs/CODEX_WORKFLOW.md`](CODEX_WORKFLOW.md) accurately reflect real sessions (no invented contributions).

## Feedback session

- [ ] **/feedback session ID retrieved** — Follow the hackathon’s `/feedback` (or equivalent) instruction and record the session ID on the submission form. _(Human; do not invent an ID here.)_

  Recorded session ID (fill at submit time): `______________________________`

## Final smoke (same day as submit)

- [ ] `npm.cmd run lint` / `typecheck` / `test` / `build` pass on the submitted revision
- [ ] Secret scan: no real keys in source or client bundles
- [ ] Progress reset instructions work if a shared demo machine is used

## Notes

| Asset           | Location                                      |
| --------------- | --------------------------------------------- |
| Pitch + setup   | [`README.md`](../README.md)                   |
| Demo narration  | [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md)       |
| Codex log       | [`docs/CODEX_WORKFLOW.md`](CODEX_WORKFLOW.md) |
| Human decisions | [`docs/DECISION_LOG.md`](DECISION_LOG.md)     |
| Env template    | [`.env.example`](../.env.example)             |
