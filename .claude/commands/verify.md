---
description: Build and smoke-test all routes
allowed-tools: Bash, Read
---

Verify the app is healthy:

1. Run `npm run build` and confirm it compiles with no type or lint errors.
   If you hit a stale `.next` chunk error, `rm -rf .next` and rebuild.
2. Start the dev server, wait for it to be ready, then check each route
   returns HTTP 200: `/`, `/board`, `/okrs`, `/calendar`.
3. Confirm the morning page renders the logo and quote, and the manifest at
   `/manifest.json` includes the Boards/OKRs/Calendar shortcuts.
4. Stop the dev server and report a short results table.

Note: the board, OKR, and calendar pages need Google sign-in to show data, so
their populated state is best confirmed manually in the browser.
