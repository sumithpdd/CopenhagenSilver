# Sitecore Marketplace Setup

This app runs as a **Sitecore Marketplace** app (iframe in Cloud Portal) or as a **standalone** event kiosk — same codebase, different configuration.

---

## Extension point

Use the **Standalone** extension point in App Studio:

| Setting | Value |
|---------|-------|
| Extension point | **Standalone** (Cloud Portal homepage) |
| Deployment URL | `http://localhost:3000` (dev) or your Vercel HTTPS URL (prod) |
| SitecoreAI / API access | Enable per org policy |

The photo booth is a full-screen kiosk tool — it does not need the Page Context Panel.

---

## Architecture split

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT                                                      │
│  MarketplaceProvider → SDK init (or standalone fallback)     │
│  AppConfigProvider   → GET /api/config                       │
│  Booth components    → generic UI (logo, backdrop, flow)   │
│  Sitecore components → optional marketing (SitecoreAiFlow)   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  SERVER (Next.js API routes — secrets never in browser)      │
│  GET  /api/config          → branding, backgrounds, prompts  │
│  GET  /api/auth/session    → secure session cookie           │
│  POST /api/composit-image  → Gemini (GOOGLE_GEMINI_API_KEY)  │
│  POST /api/upload-photo      → Firebase Admin                  │
│  GET  /api/gallery           → public gallery                │
│  GET  /api/sitecore/status   → CM credentials configured?    │
└─────────────────────────────────────────────────────────────┘
```

### Folder map

| Path | Role | Sitecore required? |
|------|------|-------------------|
| `src/lib/core/` | App config, API auth, API client | No |
| `src/lib/sitecore/` | Authoring GraphQL, brand rules | Optional |
| `src/components/booth/` | Generic booth UI | No |
| `src/components/sitecore/` | Sitecore marketing modules | Optional |
| `src/components/providers/` | Marketplace SDK + config | SDK only in iframe |
| `src/app/api/` | All server actions | No (Firebase/Gemini separate) |

---

## Step 1 — Register in App Studio

1. Log in at [portal.sitecorecloud.io](https://portal.sitecorecloud.io).
2. Open **App Studio** → **Create app** → **Custom** (private).
3. Name it e.g. **AI Photo Booth**.
4. **Extension point:** **Standalone**.
5. **Deployment URL:** `http://localhost:3000` for local dev.
6. **Logo:** Square image, min 512×512 px.
7. **Activate** and **Install** on your target environment.

---

## Step 2 — Environment variables

Copy `.env.example` to `.env.local` and configure:

### Required (all modes)

```env
GOOGLE_GEMINI_API_KEY=your_key
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### Sitecore Silver event preset

```env
APP_PRESET=sitecore-silver
```

This restores Copenhagen 2026 branding, Sitecore AI guardrails, `SILVER` photo codes, and `sitecore-silver/` storage paths.

### Marketplace mode (embedded in Sitecore)

```env
# Optional — SDK auto-detects iframe; set only to force mode:
# APP_RUNTIME_MODE=marketplace
```

### Standalone kiosk (no Sitecore)

```env
NEXT_PUBLIC_STANDALONE_MODE=true
APP_EVENT_TITLE=My Event Photo Booth
APP_EVENT_SUBTITLE=Create Your Memory
APP_WATERMARK_TEXT=MY EVENT
APP_PHOTO_CODE_PREFIX=EVENT
APP_STORAGE_PREFIX=my-event
```

### Secure APIs (recommended for public Vercel URLs)

```env
API_SECRET=choose-a-long-random-string
```

When set, `POST /api/composit-image` and `POST /api/upload-photo` require a session from `GET /api/auth/session` (handled automatically by `apiFetch` in the client).

### Sitecore Authoring API (optional — CMS-driven content)

```env
XMC_HOST=your_cm_hostname.sitecorecloud.io
SITECORE_CLIENT_ID=automation_client_id
SITECORE_CLIENT_SECRET=automation_client_secret
```

Get credentials from **XM Cloud Deploy → Credentials → Environment**.

---

## Step 3 — Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

**In Sitecore:** open Cloud Portal → your app tile. The Marketplace SDK connects to the parent window.

**Standalone:** open `http://localhost:3000` directly. SDK init fails gracefully → standalone mode.

---

## Step 4 — Deploy to Vercel

1. Push to GitHub and import in [vercel.com](https://vercel.com).
2. Set all env vars from `.env.local` in **Project → Environment Variables**.
3. Deploy and copy the HTTPS URL.
4. Update **App Studio → Deployment URL** to the Vercel URL.

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for the full checklist.

---

## API security model

| Layer | What is protected | How |
|-------|-------------------|-----|
| Gemini key | Server only | `GOOGLE_GEMINI_API_KEY` in API routes |
| Firebase Admin | Server only | Service account env vars |
| Sitecore CM | Server only | OAuth automation client |
| Mutating APIs | Optional | `API_SECRET` + `booth_api_session` cookie |
| Gallery read | Public | `GET /api/gallery` (no auth) |
| Admin | Staff only | `ADMIN_SECRET` cookie |

See [06_API_SECURITY.md](./06_API_SECURITY.md) for details.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connecting…" forever | Set `NEXT_PUBLIC_STANDALONE_MODE=true` for local dev outside Sitecore |
| 401 on composit/upload | Set `API_SECRET` and ensure client calls `/api/auth/session` first (automatic via `apiFetch`) |
| Wrong branding | Check `APP_PRESET` and `APP_*` env vars; restart dev server |
| SDK error in iframe | Deployment URL in App Studio must match running app URL exactly |
| Gallery empty | Firebase credentials + Firestore rules; see [04_TROUBLESHOOTING.md](./04_TROUBLESHOOTING.md) |

---

## Further reading

- [06_API_SECURITY.md](./06_API_SECURITY.md) — API auth patterns
- [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) — updated folder structure
- [Sitecore Marketplace docs](https://doc.sitecore.com/mp/en/developers/marketplace/introduction-to-sitecore-marketplace.html)
- [Marketplace SDK (GitHub)](https://github.com/Sitecore/marketplace-sdk)
