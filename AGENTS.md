# AGENTS.md — rules for AI coding assistants in this repo

Read this before changing anything. Team workflow (roles, branches) is in `docs/TEAM.md`.

## What this is

CPX 2026 hackathon, Track 2 (Reverse UX). A mobile-first web app that turns checkout into a
"personal procurement OA": verify → fill a procurement form → AI leader approves or rejects →
simulated order → receipt. Vite + React + TypeScript, Vercel function in `api/`, Capacitor for Android.

## Commands (all three must pass before every commit)

```bash
npm test         # vitest
npm run build    # tsc + vite build
npm run lint     # oxlint
```

## Invariants — do not break

1. **Rules decide, the LLM only words.** Approve/reject is decided in `src/domain/review.ts`.
   The LLM (`api/leader-voice.ts`) only rewrites findings. Never let model output change the decision.
2. **The demo path stays green.** `src/domain/review.test.ts` encodes the pitch demo
   (first projector submission rejected with `total-mismatch` + `why-not-rent` + `alternatives-missing`,
   resubmission on attempt 2 approved).
   If you change rules or the projector data, update those tests AND the demo script in `README.md`.
3. **The app must work with no network.** Every LLM call falls back to the rule message.
   New network features must fail silently the same way.
4. **Secrets stay server-side.** No API key in `src/`, in `VITE_*` vars, or in git.
   `api/leader-voice.ts` is public, so keep it bounded: the product id must exist in the catalog,
   rule ids come from a fixed list, form answers are truncated to `MAX_FIELD_CHARS` and sent as a
   `<申请单>` data block, output is capped, requests are rate-limited. Do not add an open-ended
   prompt/text parameter (it would turn the endpoint into a public free LLM proxy).
   Every call is logged as one JSON line (`event: "leader-voice"`); never log the key or IP.
5. **Device APIs only via `src/device/`.** Screens never call `navigator.vibrate`, Capacitor plugins,
   or `devicemotion` directly. Unsupported = silent no-op.
6. **Nothing real happens.** No real payment, no shipping, no real shop APIs. Receipts say "模拟".
7. **Product data**: `src/data/products.json`. `source: null` = placeholder. Real data must set
   `source.url` and `source.capturedAt`. No scrapers — data is collected by hand.
8. **One state machine.** All navigation goes through `Screen` in `src/flow.ts` and `render()` in
   `src/App.tsx`. New screen = new `Screen` variant + a case in `render()`.

## Conventions

- UI text is Chinese; code, identifiers and comments are English.
- Mobile-first, max width 430px. Colours come from the role variables in `src/index.css`
  (`--oa` bureaucracy, `--reject`, `--approve`, `--muted`); do not add ad-hoc colours.
- One screen per file in `src/screens/`. Keep diffs small and inside the files your task owns
  (ownership table in `docs/TEAM.md`). Ask before editing shared files: `src/App.tsx`,
  `src/flow.ts`, `src/domain/types.ts`.
- Dev server stays on localhost. Never add `--host` / `0.0.0.0`; use a Vercel preview to test on phones.
- Stage files by explicit path (`git add src/screens/Foo.tsx`), never `git add -A` / `git add .`.
- Do not reformat files you are not otherwise changing.
