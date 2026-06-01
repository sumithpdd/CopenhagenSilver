---
description: Seed Firestore data (OKRs, tasks, tags) for a user
argument-hint: <user-email>
allowed-tools: Bash, Read
---

Seed the Firestore database for the user: $1

Prerequisites (check first, ask if missing):
- A Firebase Admin service account key file exists (git-ignored). Ask the user
  for its path if `GOOGLE_APPLICATION_CREDENTIALS` is not already set.
- Warn that `seed-okrs-with-tasks.js` DELETES existing OKRs for the user first.

Then run, from the project root:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="<path-to-serviceAccountKey.json>"
node data-migration/seed-okrs-with-tasks.js $1
node data-migration/seed-tags.js $1
```

After seeding, verify with the Admin SDK that the board, OKRs, and tags exist
for $1, and report the counts. Never print the key contents or commit the key.
