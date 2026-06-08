# 🔐 Security Guide

**IMPORTANT:** Never commit secrets, API keys, or personal data to GitHub.

---

## ⚠️ What Should NEVER Be in Git

### ❌ NEVER Commit
- `.env` files with real keys
- `.env.local` with credentials
- Firebase service account JSON files
- API keys (Gemini, SendGrid, etc.)
- Database passwords
- Private keys or certificates
- Personal information
- Credit card data

### ✅ DO Commit
- `.env.example` with dummy/placeholder values
- `.gitignore` rules
- Code and configuration
- Documentation (with placeholders for secrets)

---

## 🔑 Environment Variables Setup

### For Local Development

1. **Copy the example file:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local` with YOUR credentials:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_ACTUAL_KEY_HERE
GOOGLE_GEMINI_API_KEY=YOUR_ACTUAL_KEY_HERE
FIREBASE_PRIVATE_KEY=YOUR_ACTUAL_KEY_HERE
API_SECRET=YOUR_RANDOM_SECRET_HERE
```

For API route security details, see [06_API_SECURITY.md](./06_API_SECURITY.md).

3. **NEVER commit `.env.local`:**
```bash
# Verify it's in .gitignore
cat .gitignore | grep "\.env"
```

---

## 🚀 For Vercel Deployment

### Step 1: Set Environment Variables in Vercel

**Go to:** Vercel Dashboard → Project Settings → Environment Variables

**Add each variable:**
```
NEXT_PUBLIC_FIREBASE_API_KEY = your_actual_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_actual_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_actual_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_actual_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_actual_value
NEXT_PUBLIC_FIREBASE_APP_ID = your_actual_value
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = your_actual_value
FIREBASE_PROJECT_ID = your_actual_value
FIREBASE_PRIVATE_KEY_ID = your_actual_value
FIREBASE_PRIVATE_KEY = your_actual_value (multi-line)
FIREBASE_CLIENT_EMAIL = your_actual_value
FIREBASE_CLIENT_ID = your_actual_value
GOOGLE_GEMINI_API_KEY = your_actual_value
```

### Step 2: Ensure Code Has No Hardcoded Values

All keys must come from environment variables:
```typescript
// ✅ GOOD
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

// ❌ BAD
const apiKey = "YOUR_GEMINI_API_KEY_HERE"; // Never hardcode!
```

### Step 3: Deploy

```bash
git push origin main
# Vercel auto-deploys with environment variables
```

---

## 🛡️ Git Pre-Commit Hook

Add this to prevent accidental commits of secrets:

**Create `.git/hooks/pre-commit`:**
```bash
#!/bin/bash
# Prevent committing secrets

if grep -r "AQ\.Ab8RN" . --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".git"; then
    echo "❌ ERROR: Gemini API key found in code!"
    exit 1
fi

if grep -r "firebase-adminsdk" . --include="*.json" 2>/dev/null | grep -v node_modules | grep -v ".git"; then
    echo "❌ ERROR: Firebase service account found!"
    exit 1
fi

echo "✅ No secrets detected"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 📋 Checklist Before Pushing to GitHub

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` exists with dummy values
- [ ] No API keys in markdown files
- [ ] No hardcoded secrets in source code
- [ ] `.firebase/` is in `.gitignore`
- [ ] `serviceAccountKey.json` is in `.gitignore`
- [ ] Run: `git status` - no `.env` files shown
- [ ] Run: `git diff` - review all changes for secrets

---

## 🚨 If You Accidentally Committed a Secret

### Immediate Actions
```bash
# STOP! Don't push yet
# 1. Remove the file from git history
git rm --cached .env.local
git commit --amend --no-edit
git push --force-with-lease

# 2. Rotate all exposed keys/credentials
# - Go to Firebase Console, regenerate service account
# - Go to Google Cloud, regenerate Gemini API key
# - Update everywhere with new credentials

# 3. Add the file to .gitignore
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Add .env.local to gitignore"
git push
```

### Long-term
```bash
# Use git history cleanup (advanced)
# git-filter-repo is recommended
# See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure
```

---

## 🔍 What to Look For in Code Review

### Never Allow These in Pull Requests

```typescript
// ❌ Hardcoded API key
const API_KEY = "sk-12345...";

// ❌ Hardcoded database password
const dbPassword = "super-secret-123";

// ❌ Hardcoded service account
const serviceAccount = {
  private_key: "-----BEGIN PRIVATE KEY-----..."
};

// ✅ Use environment variables instead
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const dbPassword = process.env.DATABASE_PASSWORD;
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
```

---

## 📚 Environment Variables Explained

### Public Variables (Safe to Expose)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_APP_URL
```
These are sent to the browser anyway, marked with `NEXT_PUBLIC_` prefix.

### Secret Variables (Never Expose)
```
FIREBASE_PRIVATE_KEY
GOOGLE_GEMINI_API_KEY
FIREBASE_CLIENT_EMAIL
SENDGRID_API_KEY
```
These are server-only, never sent to browser.

---

## 🔐 Vercel Environment Variables Setup

### Public Variables
Go to Settings → Environment Variables → Select "Exposed to Client"
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

### Secret Variables
Go to Settings → Environment Variables → Keep "Protected" enabled
```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FIREBASE_CLIENT_ID
GOOGLE_GEMINI_API_KEY
SENDGRID_API_KEY
```

---

## 🚀 GitHub + Vercel Workflow

```
1. Code locally with .env.local (not committed)
   ↓
2. Push to GitHub (only .env.example)
   ↓
3. Vercel auto-deploys with environment variables set in dashboard
   ↓
4. Live site uses secrets from Vercel environment
```

---

## ✅ Pre-Deployment Security Checklist

Before pushing public:

```bash
# Check for secrets in staged files
git diff --cached | grep -i "key\|secret\|password" || echo "✅ OK"

# Check entire repo (careful!)
git log --all --source --remotes -S "AQ.Ab8RN" || echo "✅ OK"

# Verify .env files are ignored
git check-ignore .env.local
git check-ignore .env.example  # Should NOT be ignored

# Verify no hardcoded keys
grep -r "firebase-adminsdk\|private_key" src/ || echo "✅ OK"
```

---

## 📞 If Compromise Happens

If credentials are exposed:

1. **Immediately rotate all keys/credentials**
2. **Remove from git history** (see section above)
3. **Review git logs** for who accessed secrets
4. **Update Vercel environment variables** with new credentials
5. **Monitor accounts** for unauthorized access
6. **Report to platform** if needed

---

## 🔗 Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Git Secrets Prevention](https://github.com/awslabs/git-secrets)

---

## 📋 Summary

```
✅ DO:
- Use .env.example with placeholders
- Store real secrets in .env.local (not committed)
- Use NEXT_PUBLIC_ for public vars only
- Set environment variables in Vercel dashboard
- Review git diff before committing
- Rotate compromised credentials immediately

❌ DON'T:
- Commit .env.local or real secrets
- Hardcode API keys in source code
- Share credentials in chat/email
- Use same key across environments
- Forget to remove secrets from git history
```

---

**Last Updated:** June 2, 2026  
**Status:** Secure for Public GitHub

🔒 **Your code is safe to push to public GitHub!**
