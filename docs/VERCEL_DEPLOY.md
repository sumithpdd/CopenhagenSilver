# 🚀 Deploy to Vercel

**Quick deployment for public GitHub + Vercel**

---

## 📋 Pre-Deployment Checklist

- [ ] Code on GitHub: https://github.com/sumithpdd/CopenhagenSilver
- [ ] `.env.local` NOT committed (checked via `.gitignore`)
- [ ] `.env.example` has dummy values only
- [ ] No hardcoded API keys in code
- [ ] All tests passing
- [ ] Build succeeds locally: `npm run build`

---

## 1️⃣ Connect GitHub to Vercel

### Option A: New Project
```
1. Go to: https://vercel.com/sumithpdds-projects
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Paste: https://github.com/sumithpdd/CopenhagenSilver.git
5. Authorize GitHub
6. Click "Import"
```

### Option B: Existing Connection
```
1. Go to: https://vercel.com/sumithpdds-projects
2. Click on "CopenhagenSilver" project (if exists)
3. Go to Settings → Git Integration
4. Verify GitHub repo is connected
```

---

## 2️⃣ Add Environment Variables

**Go to:** Settings → Environment Variables

### Add Each Variable:

**Public Variables (Exposed to Client):**
```
NEXT_PUBLIC_FIREBASE_API_KEY = paste_your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = paste_your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID = paste_your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = paste_your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = paste_your_value
NEXT_PUBLIC_FIREBASE_APP_ID = paste_your_value
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = paste_your_value
```

**Secret Variables (Server-Only):**
```
FIREBASE_PROJECT_ID = paste_your_value
FIREBASE_PRIVATE_KEY_ID = paste_your_value
FIREBASE_PRIVATE_KEY = paste_your_value
FIREBASE_CLIENT_EMAIL = paste_your_value
FIREBASE_CLIENT_ID = paste_your_value
GOOGLE_GEMINI_API_KEY = paste_your_value
```

### Get These Values From:
- **Firebase:** https://console.firebase.google.com → Project Settings → Service Accounts
- **Gemini:** https://aistudio.google.com/app/apikey

---

## 3️⃣ Deploy

### Automatic (Recommended)
```
1. Push to GitHub
2. Vercel auto-detects changes
3. Builds & deploys automatically
4. Status shown in GitHub PR
```

### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
# Follow prompts, link to project

# To production
vercel --prod
```

---

## ✅ Verify Deployment

After build completes:

1. **Check Vercel Dashboard**
   - Status should show "Ready"
   - No errors in logs

2. **Test Live Site**
   - Go to provided URL (e.g., https://copenhagen-silver.vercel.app)
   - Test complete photo flow
   - Check print functionality
   - Verify logo on photos

3. **Monitor Logs**
   - Vercel Dashboard → Deployments
   - View build logs and runtime logs

---

## 🔄 Update & Redeploy

```bash
# 1. Make code changes locally
# 2. Test locally
npm run dev

# 3. Build for production
npm run build
npm start

# 4. Commit & push
git add .
git commit -m "Fix: something"
git push origin main

# 5. Vercel auto-deploys
# Monitor at: https://vercel.com/sumithpdds-projects/copenhagen-silver
```

---

## 🐛 Troubleshooting Vercel Deployment

### Issue: Build Fails
```
1. Check build logs in Vercel Dashboard
2. Common issues:
   - Missing environment variable
   - TypeScript errors
   - Port already in use
3. Fix locally and push again
```

### Issue: Environment Variables Not Working
```
1. Verify variable is set in Vercel dashboard
2. Redeploy after adding variable
3. Check console.log in browser devtools
4. Public vars: should be in HTML
5. Secret vars: should not be in HTML
```

### Issue: 404 on Deployed Site
```
1. This is a Next.js SPA issue
2. Vercel auto-configures this
3. If not working:
   - Check vercel.json configuration
   - Might need to set rewrites for SPA
```

### Issue: Photos Not Processing
```
1. Check Gemini API quota (Google Cloud Console)
2. Verify GOOGLE_GEMINI_API_KEY in Vercel env vars
3. Check Firebase credentials
4. Look at Vercel function logs
```

---

## 📊 Vercel Environment Variables Tips

### Making Variables Available:

**Public (to browser):**
- Use prefix `NEXT_PUBLIC_`
- Will be in client-side JavaScript
- Only use for non-sensitive data

**Secret (server only):**
- No prefix
- Only available on server/API routes
- Safe for API keys, database passwords

### Example in Code:
```typescript
// Server-side (API routes) - can use both
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY; // ✅ Secret

// Client-side (components) - only public vars
const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY; // ✅ Public
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY; // ❌ Error - secret var not available
```

---

## 🔐 Security Reminder

**In Vercel Environment Variables:**
- ✅ Can be seen by project admins
- ✅ Are not in git history
- ✅ Are not visible in GitHub
- ❌ Should not be shared via email/chat
- ❌ Should not be logged or printed

**Before pushing to GitHub:**
```bash
# Verify no secrets in git
git log --all -p | grep -i "API_KEY\|PRIVATE_KEY" || echo "✅ Safe"

# Verify .env.local in gitignore
git check-ignore .env.local && echo "✅ Protected"
```

---

## 📈 Monitoring Live Site

### Vercel Dashboard
- **Deployments:** See build history and logs
- **Analytics:** View page views, response times
- **Errors:** See runtime errors from production
- **Performance:** Check Core Web Vitals

### Logs
```bash
# View live logs
vercel logs

# View specific deployment
vercel logs --since 1h
```

---

## 🎯 Domain Setup (Optional)

To use custom domain:

```
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS at registrar
4. Vercel provides DNS records
5. SSL auto-configures
```

---

## 🔄 Rollback to Previous Deployment

If something breaks:

```
1. Go to Vercel Dashboard → Deployments
2. Find previous good deployment
3. Click "..." menu
4. Select "Promote to Production"
5. Previous version is live again
```

---

## 📞 Common Vercel URLs

| Feature | URL |
|---------|-----|
| Dashboard | https://vercel.com/sumithpdds-projects |
| Project | https://vercel.com/sumithpdds-projects/copenhagen-silver |
| Settings | https://vercel.com/sumithpdds-projects/copenhagen-silver/settings |
| Deployments | https://vercel.com/sumithpdds-projects/copenhagen-silver/deployments |
| Env Vars | https://vercel.com/sumithpdds-projects/copenhagen-silver/settings/environment-variables |

---

## ✅ Production Checklist

Before marking as "production ready":

- [ ] Environment variables set in Vercel
- [ ] Build succeeds in Vercel
- [ ] Site loads in browser
- [ ] Photo flow works end-to-end
- [ ] Print functionality works
- [ ] No console errors
- [ ] Load time acceptable
- [ ] Mobile responsive
- [ ] Monitoring set up

---

## 🚀 After Deployment

1. **Share Live URL**
   - GitHub README
   - Team/stakeholders
   - Event organizers

2. **Monitor Performance**
   - Check Vercel dashboard daily
   - Watch for errors
   - Monitor API usage

3. **Test on Event Day**
   - Test on actual devices
   - Verify Firebase/Gemini working
   - Check print on actual printers

---

## 💡 Pro Tips

1. **Preview Deployments**
   - Every PR gets a preview URL
   - Test before merging to main
   - Shared with reviewers

2. **Environment by Branch**
   - Can set different vars per branch
   - Useful for staging vs production

3. **Analytics**
   - Vercel tracks page views
   - Shows most popular routes
   - Useful for monitoring

4. **Automatic Deploys**
   - No manual deployment needed
   - Merge to main = auto-deploy
   - Peace of mind!

---

**Status:** ✅ Ready to Deploy  
**Security:** ✅ All Secrets Protected  
**Monitoring:** ✅ Vercel Dashboard Available

🚀 **You're all set! Push to GitHub and deploy to Vercel!**

---

**Next:** Push code to GitHub → Vercel auto-deploys → Live at vercel.app URL

```bash
git push origin main
# Sit back, Vercel handles the rest!
```
