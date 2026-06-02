# AGENTS.md

Guidance for AI agents (Cursor) working in this repository. Human docs live in `docs/`; this file mirrors `CLAUDE.md` for Cursor.

## Project Overview

**Sitecore Silver Photo Booth** — React/Next.js photo booth for Sitecore's 25-year anniversary (Copenhagen, June 11, 2026).

User flow: name → camera/upload → background → AI prompt → Gemini compositing → save/print/share → gallery.

**Reference codebase**: `C:\code\flutter\photo_booth_ai` (feature parity and data models).

## Documentation Map

| Doc | Use when |
|-----|----------|
| [docs/00_GETTING_STARTED.md](docs/00_GETTING_STARTED.md) | Setup, env vars |
| [docs/01_ARCHITECTURE.md](docs/01_ARCHITECTURE.md) | Structure, data flow |
| [docs/02_FEATURES.md](docs/02_FEATURES.md) | Feature behavior |
| [docs/03_DEVELOPMENT.md](docs/03_DEVELOPMENT.md) | How to add pages/components |
| [docs/04_TROUBLESHOOTING.md](docs/04_TROUBLESHOOTING.md) | Common fixes |
| [docs/SECURITY.md](docs/SECURITY.md) | Secrets, env, git |
| [docs/BRANDING_GUIDE.md](docs/BRANDING_GUIDE.md) | Silver theme, Tailwind |
| [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) | Production deploy |

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript
- Zustand (session UI state) + TanStack Query (server data)
- Firebase (Firestore, Storage, Admin on server)
- Google Gemini 2.5 Flash (image compositing, **server-only**)
- Tailwind CSS, React Hook Form + Zod

## Actual Routes (codebase)

Pages under `src/app/`:

| Route | File |
|-------|------|
| `/` | `page.tsx` |
| `/input` | `input/page.tsx` |
| `/camera` | `camera/page.tsx` |
| `/backgrounds` | `backgrounds/page.tsx` |
| `/prompts` | `prompts/page.tsx` |
| `/processing` | `processing/page.tsx` |
| `/result` | `result/page.tsx` |
| `/gallery` | `gallery/page.tsx` |

API routes:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/composit-image` | Gemini compositing |
| POST | `/api/upload-photo` | Firebase Storage + Firestore |
| GET | `/api/gallery` | List gallery photos |

## Folder Structure

```
src/
├── app/              # Pages + API routes
├── components/       # photo-booth/, ui/, common/
├── lib/              # firebase, validators, hooks, prompt-sanitizer
├── store/            # photo-booth.ts (Zustand)
├── types/            # index.ts
├── data/             # backgrounds.ts, prompts.ts
public/               # Static assets
docs/                 # Human documentation
.cursor/              # Cursor rules + slash commands
```

## Patterns (must follow)

### State

- **Zustand** (`usePhotoBoothStore`): session, selections, captured/composited photos, processing flags.
- **TanStack Query**: gallery fetch, upload/composite mutations via API routes.
- Never call Gemini or Firebase Admin from client components.

### API routes

- Validate with Zod (`src/lib/validators.ts`).
- Read secrets from `process.env` only (never hardcode).
- Gemini key: `GOOGLE_GEMINI_API_KEY` (server-only).

### Forms

React Hook Form + `zodResolver` + schemas in `lib/validators.ts`.

### Images

- `next/image` for static assets in `public/`.
- `<img>` for dynamic Firebase URLs (CORS).
- Gemini input: base64 JPEG/PNG.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build
npm run type-check
npm run lint
npm run format
npm test
```

## Flutter ↔ React mapping

| Flutter | This repo |
|---------|-----------|
| Riverpod | Zustand + TanStack Query |
| Service classes | `lib/` + `src/app/api/*` |
| Freezed models | `types/` + Zod |
| GoRouter | App Router file routes |

## Event constraints

- Branding: silver (#b8b8b8), dark (#1a1a1a), gold accents — see `docs/BRANDING_GUIDE.md`.
- Kiosk-friendly: large touch targets, portrait 4K.
- Deploy: **Vercel** (not Firebase Hosting for primary deploy per README).
- Load: ~200 attendees; tolerate slow network.

## Security (non-negotiable)

- Never commit `.env.local`, service account JSON, or real API keys.
- Never `git add -f` env files or `*firebase-adminsdk*`.
- `GOOGLE_GEMINI_API_KEY` and `FIREBASE_PRIVATE_KEY` only in API routes / server.
- Run `/safety-check` command before pushing (see `.cursor/commands/`).

## Debugging

| Symptom | Check |
|---------|--------|
| Firebase errors | `.env.local`, console rules, restart dev server |
| Gemini 403/429 | API key, quota in Google AI Studio |
| Images broken | Storage CORS, public read rules |
| State stale | `'use client'`, Zustand selectors, optional chaining on `session` |

## Cursor-specific

- **Rules**: `.cursor/rules/*.mdc` (auto-applied by file context).
- **Slash commands**: `.cursor/commands/*.md` (`/verify`, `/safety-check`, `/update-docs`).
- Prefer minimal diffs; match existing code style; do not commit unless asked.

---

**Last updated**: June 2, 2026
