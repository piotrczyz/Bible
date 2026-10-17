---
project: bible-app
context_type: brownfield
created: 2026-10-17
updated: 2026-10-17
source: detected-from-cwd
---

# Bible App — Tech Stack

## Languages & Runtimes
- TypeScript 5 (strict mode)
- Node 20 (pnpm)

## Frontend
- Framework: Next.js 16 (React 19)
- Styling: Tailwind CSS 4
- UI Components: shadcn/ui (Radix UI primitives)
- Mobile wrapper: Capacitor (ios/ and android/ not yet initialized)

## Backend
- Firebase Cloud Functions (TypeScript) — `functions/`, AI-powered verse search (OpenAI integration)

## Data & Storage
- IndexedDB via Dexie.js (planned, offline-first local storage; not yet implemented in code)
- Firebase Hosting for the web app (see `firebase.json`, `.firebaserc`)

## Infrastructure & Deploy
- Packaging: none (static Next.js build deployed to Firebase Hosting)
- Deploy target: Firebase (Hosting + Cloud Functions)

## Testing
- No test framework configured yet (deviation from palette default of Vitest/Playwright — `context/foundation/README.md` testing status: "Not started")

## CI/CD
- GitHub Actions (`.github/workflows/firebase-deploy.yml`)

## Issue Tracker
- GitHub Issues

## Commands

- Install: `pnpm install --frozen-lockfile` (root); `npm install` in `functions/` (has its own `package-lock.json`)
- Build: `pnpm build` (`next build`)
- Test: none configured
- Lint / typecheck: `pnpm lint && pnpm typecheck`

## Tooling
- Package manager (JS): pnpm (root uses `pnpm-lock.yaml`; a stray `package-lock.json` also exists at root — pnpm is the one CI uses)
- Package manager (functions/): npm (`functions/package-lock.json`)

## Open Stack Questions
1. **Unit/E2E test runner** — no Vitest/Playwright configured; palette default would be Vitest for unit tests. Pin before adding automated test coverage.
