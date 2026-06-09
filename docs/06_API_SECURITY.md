# API Security

All sensitive operations run through **Next.js API routes**. Client components never call Gemini, Firebase Admin, or Sitecore Authoring APIs directly.

---

## Secret tiers

### Server-only (never in browser)

| Variable | Used by |
|----------|---------|
| `GOOGLE_GEMINI_API_KEY` | `/api/composit-image` |
| `FIREBASE_PRIVATE_KEY` / `FIREBASE_SERVICE_ACCOUNT_KEY` | `/api/upload-photo`, `/api/gallery`, `/api/admin/*` |
| `SITECORE_CLIENT_ID` / `SITECORE_CLIENT_SECRET` | Sitecore Authoring GraphQL (optional) |
| `ADMIN_SECRET` | `/api/admin/login` |
| `API_SECRET` | Session signing for mutating routes |

### Public (`NEXT_PUBLIC_*`)

Firebase web config only — used if client SDK is enabled. The current booth flow does **not** expose Gemini or Admin credentials to the browser.

---

## Route protection

| Route | Method | Auth |
|-------|--------|------|
| `/api/config` | GET | Public (read-only config) |
| `/api/auth/session` | GET | Public (issues session cookie when `API_SECRET` set) |
| `/api/composit-image` | POST | `requireApiAuth` when `API_SECRET` set |
| `/api/upload-photo` | POST | `requireApiAuth` when `API_SECRET` set |
| `/api/gallery` | GET | Public |
| `/api/admin/login` | POST | Password → httpOnly cookie |
| `/api/admin/photos` | GET/PATCH/DELETE | Admin cookie |
| `/api/sitecore/status` | GET | Public (boolean flags only) |

---

## API_SECRET flow

When `API_SECRET` is configured:

1. Client calls `GET /api/auth/session` (automatic via `apiFetch` in `src/lib/core/api-client.ts`).
2. Server sets `booth_api_session` httpOnly cookie (4-hour HMAC-signed token).
3. Mutating requests include the cookie (`credentials: 'include'`).
4. Server validates cookie or `Authorization: Bearer <API_SECRET>` header.

When `API_SECRET` is **not** set (event kiosk / local dev), mutating routes are open.

**Production recommendation:** Always set `API_SECRET` on public Vercel deployments.

---

## Admin access

**Page:** `/admin` (e.g. `https://your-app.vercel.app/admin`)

| Variable | Purpose |
|----------|---------|
| `ADMIN_SECRET` | Staff password; also stored in httpOnly cookie after login |
| `NEXT_PUBLIC_ENABLE_ADMIN=true` | Shows Admin footer link on booth pages |

Login: `POST /api/admin/login` with `{ "password": "<ADMIN_SECRET>" }`. Session cookie lasts 8 hours.

---

## Marketplace iframe trust model

When embedded in Sitecore Marketplace:

- The app loads only from the registered deployment URL.
- Same-origin `fetch` to `/api/*` is trusted.
- SDK context (`application.context`) is provided by the parent window via `postMessage`.
- Sitecore OAuth credentials stay on the server.

For additional hardening beyond this baseline:

- Set `API_SECRET` on all production deployments.
- Add rate limiting at the Vercel edge or API gateway.
- Restrict Firebase Storage write rules to authenticated service account only.

---

## Implementation files

| File | Purpose |
|------|---------|
| `src/lib/core/api-auth.ts` | `requireApiAuth`, session token signing |
| `src/lib/core/api-client.ts` | Client-side `apiFetch` with session bootstrap |
| `src/app/api/auth/session/route.ts` | Issues session cookie |

---

## Server-to-server calls

For automation or testing, pass the secret directly:

```bash
curl -X POST http://localhost:3000/api/composit-image \
  -H "Authorization: Bearer YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"photo":"...","prompt":"...","backgroundDescription":"..."}'
```

---

See also [SECURITY.md](./SECURITY.md) for git and env hygiene.
