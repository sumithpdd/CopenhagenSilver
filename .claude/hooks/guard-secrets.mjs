// PreToolUse hook (Bash): block commands that could stage a Firebase service
// account key or a real env file into git. Defense in depth on top of
// .gitignore. Exit code 2 blocks the tool and shows the message to Claude.
import { readFileSync } from "node:fs";

let raw = "";
try {
  raw = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let data = {};
try {
  data = JSON.parse(raw);
} catch {
  process.exit(0);
}

const cmd = String(data?.tool_input?.command || "");
const isGitStage = /\bgit\s+(add|commit)\b/i.test(cmd);

const mentionsKey = /(serviceaccountkey|firebase-adminsdk|firebase-service-account)/i.test(cmd);
const forceAddsEnv = /git\s+add\b[^\n]*-f[^\n]*\.env(?!\.local\.example)/i.test(cmd);

if ((isGitStage && mentionsKey) || forceAddsEnv) {
  console.error(
    "Blocked by guard-secrets: this command may add a Firebase service account " +
      "key or a real .env file to git. These are git-ignored on purpose. If you " +
      "are certain, run the command yourself in a terminal."
  );
  process.exit(2);
}

process.exit(0);
