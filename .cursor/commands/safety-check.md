# Safety Check

Scan the repo before any push. This project may be public on GitHub.

Report a short pass/fail table:

1. **Service account keys**: `git check-ignore` on `*firebase-adminsdk*.json` and `serviceAccountKey*.json`; `git ls-files` must not list them.
2. **Env files**: `.env.local` must not be tracked; only `.env.example` with placeholders may be committed.
3. **Tracked secrets scan** (exclude `node_modules`, `.git`):
   - `AIzaSy` (real keys in source, not `.env.example` placeholders)
   - `BEGIN PRIVATE KEY`, `private_key`
   - Hardcoded `GOOGLE_GEMINI_API_KEY=` values that are not placeholders
4. **Docs**: No real credentials in `docs/` or markdown (placeholders only).

If anything fails, stop and list exact paths. Do not push until fixed. See `docs/SECURITY.md`.
