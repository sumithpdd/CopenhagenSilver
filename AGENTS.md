# AGENTS.md

Guidance for AI agents (Cursor) working in this repository. Human docs live in `docs/`; this file mirrors `CLAUDE.md` for Cursor.

## Project Overview

**AI Photo Booth** — React/Next.js event photo booth. Runs as a **Sitecore Marketplace** app or **standalone** kiosk (same codebase).

User flow: name → camera/upload → background → AI prompt → Gemini compositing → save/print/share → gallery.

**Marketplace reference**: `C:\code\sitecore\Scmarketplaceapps\ArticleSummaryGenerator\ai-article-summary-generator`
**Flutter reference**: `C:\code\flutter\photo_booth_ai` (feature parity and data models).

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
| [docs/05_MARKETPLACE.md](docs/05_MARKETPLACE.md) | Sitecore Marketplace setup |
| [docs/06_API_SECURITY.md](docs/06_API_SECURITY.md) | Secure API patterns |

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript
- Zustand (session UI state) + TanStack Query (server data)
- Firebase (Firestore, Storage, Admin on server)
- Google Gemini 2.5 Flash (image compositing, **server-only**)
- Sitecore Marketplace SDK (`@sitecore-marketplace-sdk/client`, `xmc`)
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
| `/admin` | `admin/page.tsx` — staff moderation (`ADMIN_SECRET`) |
| `/summary` | `summary/page.tsx` — 25-year keepsake timeline |
| `/privacy` | `privacy/page.tsx` |

API routes:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/config` | App branding + backgrounds/prompts |
| GET | `/api/auth/session` | API session cookie (when `API_SECRET` set) |
| POST | `/api/composit-image` | Gemini compositing (secured) |
| POST | `/api/upload-photo` | Firebase Storage + Firestore (secured) |
| GET | `/api/gallery` | List gallery photos |
| GET | `/api/sitecore/status` | Sitecore CM credentials configured? |
| POST | `/api/admin/login` | Staff password → httpOnly cookie |
| GET/PATCH/DELETE | `/api/admin/photos` | Gallery moderation (admin cookie) |

## Folder Structure

```
src/
├── app/              # Pages + API routes (all server actions via /api/*)
├── components/
│   ├── booth/        # Generic UI (BoothLogo, BoothBackdrop)
│   ├── sitecore/     # Optional Sitecore modules (SitecoreAiFlow)
│   ├── providers/    # MarketplaceProvider, AppConfigProvider
│   ├── common/       # BoothLayout, GDPR
│   └── photo-booth/  # PhotoPreviewModal
├── lib/
│   ├── core/         # app-config, api-auth, api-client, runtime-mode
│   └── sitecore/     # authoring-api, brand-rules (optional)
├── store/            # photo-booth.ts (Zustand)
├── data/             # backgrounds.ts, prompts.ts (defaults)
public/               # Static assets
docs/                 # Human documentation
.cursor/              # Cursor rules + slash commands
```

## Patterns (must follow)

### State

- **Zustand** (`usePhotoBoothStore`): session, selections, captured/composited photos, processing flags.
- **TanStack Query**: gallery fetch, upload/composite mutations via API routes.
- Never call Gemini or Firebase Admin from client components.

### Runtime modes

- **Standalone**: `NEXT_PUBLIC_STANDALONE_MODE=true` — skip Marketplace SDK.
- **Marketplace**: embedded in Sitecore iframe — SDK auto-init, graceful fallback.
- **Sitecore Silver preset**: `APP_PRESET=sitecore-silver` — Copenhagen event branding.

### API routes

- Validate with Zod (`src/lib/validators.ts`).
- Read secrets from `process.env` only (never hardcode).
- Gemini key: `GOOGLE_GEMINI_API_KEY` (server-only).
- Mutating routes: `requireApiAuth()` when `API_SECRET` is set.
- Client calls: use `apiFetch` from `src/lib/core/api-client.ts`.
- Config: `resolveAppConfig()` on server, `useAppConfig()` on client.

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
