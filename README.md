# Ameego

A pixel-art learning interface for practicing clear interview stories.

## Local commands

On Windows PowerShell, use `npm.cmd` because the host execution policy may block
the `npm.ps1` shim.

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run format
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

The Interview Center requires a server-only OpenAI API key for resume extraction and
personalized question generation:

```powershell
Copy-Item .env.example .env.local
```

Set `OPENAI_API_KEY` in `.env.local`, then restart the development server. The optional
`OPENAI_MODEL` defaults to `gpt-5.6`. Never expose either value with a `NEXT_PUBLIC_`
prefix.

The current simulator saves confirmed attempts in versioned browser storage. Raw
resume files are sent only for extraction with OpenAI response storage disabled and
are not added to browser persistence. After saving an attempt, the learner may request
GPT-5.6 STAR feedback grounded in exact excerpts from the confirmed transcript.
Evaluation results are not yet added to attempt history.

The evaluator is communication practice, not an official grade or hiring decision. It
does not assess emotion, honesty, intelligence, employability, accent, confidence,
nervousness, or eye contact.
