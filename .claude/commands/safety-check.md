---
description: Scan the repo for secrets and verify git-ignores before pushing
allowed-tools: Bash(git*), Bash(grep*), Glob, Read
---

This is a public repo. Before any push, confirm nothing sensitive is tracked.

Do the following and report a short pass/fail table:

1. Confirm the service account key is git-ignored and untracked:
   - `git check-ignore` any `*-firebase-adminsdk-*.json` / `serviceAccountKey*.json`
   - `git ls-files` must not list it
2. Confirm `.env.local` is not tracked (only `.env.local.example` may be).
3. Scan tracked files for secrets and personal data:
   - Firebase web API keys (`AIzaSy`), `private_key`, `BEGIN PRIVATE KEY`
   - real email addresses (ignore `example.com` / placeholders)
   - the Firebase project id and numeric sender/app ids
4. Check that no real name or email appears in committed files OR in
   `git log` author/committer metadata.

If everything is clean, say so clearly. If anything is exposed, stop and
explain exactly what and where, and propose the fix (do not push).
