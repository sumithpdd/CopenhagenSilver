# Verify

Build and smoke-test the photo booth app.

1. Run `npm run build`. If stale `.next` errors appear, delete `.next` and rebuild.
2. Run `npm run type-check` and `npm run lint` if build succeeds.
3. Start `npm run dev`, wait until ready, then confirm these routes return HTTP 200:
   - `/`, `/input`, `/camera`, `/backgrounds`, `/prompts`, `/gallery`
4. Confirm home page shows Sitecore Silver branding and navigation to Create Photo / Gallery.
5. Stop the dev server and report a short pass/fail table.

Note: `/processing` and `/result` need session state in Zustand; full AI flow requires `.env.local` with Firebase + Gemini keys — test manually in the browser for end-to-end compositing.
