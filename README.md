# Sitecore Silver Photo Booth 📸

AI-powered photo booth for Sitecore's 25-year anniversary celebration in Copenhagen (June 11, 2026).

**Built with**: React 18 + Next.js 14 + TypeScript + Vercel + Google Gemini AI

---

## 📚 Documentation

All documentation is in the `docs/` folder. Start here:

| Document | Purpose |
|----------|---------|
| **[docs/00_GETTING_STARTED.md](docs/00_GETTING_STARTED.md)** | 🚀 Start here! Installation & setup |
| **[docs/01_ARCHITECTURE.md](docs/01_ARCHITECTURE.md)** | 🏗️ Project structure & patterns |
| **[docs/02_FEATURES.md](docs/02_FEATURES.md)** | ✨ Feature overview |
| **[docs/03_DEVELOPMENT.md](docs/03_DEVELOPMENT.md)** | 💻 Development guide |
| **[docs/04_TROUBLESHOOTING.md](docs/04_TROUBLESHOOTING.md)** | 🔧 Common issues & fixes |
| **[CLAUDE.md](./CLAUDE.md)** | 👨‍💻 Developer guide (for IDE) |
| **[docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)** | 🚀 Deploy to Vercel |
| **[docs/SECURITY.md](docs/SECURITY.md)** | 🔐 Security best practices |
| **[docs/BRANDING_GUIDE.md](docs/BRANDING_GUIDE.md)** | 🎨 Design system & colors |

---

## ⚡ Quick Start

```bash
# 1. Install
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Run
npm run dev
# Opens http://localhost:3000
```

**Full setup:** See [docs/00_GETTING_STARTED.md](docs/00_GETTING_STARTED.md)

---

## 🎯 Features

✅ Photo capture/upload  
✅ 4 AI-themed backgrounds  
✅ 12+ transformations with Gemini AI  
✅ Sitecore logo on photos  
✅ Print & download  
✅ Professional branding  

---

## 📦 Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript, Tailwind CSS
- **State**: Zustand + TanStack Query
- **AI**: Google Gemini 2.5 Flash
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Deployment**: Vercel
- **Forms**: React Hook Form + Zod

---

## 🚀 Deployment

Deploy to Vercel:
```bash
npm run build
git push origin main
# Vercel auto-deploys
```

See [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) for full guide.

---

## 🔐 Security

- No hardcoded secrets in code
- Use `.env.local` locally (not committed)
- Environment variables in Vercel dashboard
- See [docs/SECURITY.md](docs/SECURITY.md)

---

## 📊 Project Structure

```
src/
├── app/          # Next.js pages & API routes
├── components/   # React components
├── lib/          # Utilities & hooks
├── store/        # Zustand state
├── types/        # TypeScript types
└── styles/       # CSS & Tailwind

docs/
├── 00_GETTING_STARTED.md
├── 01_ARCHITECTURE.md
├── 02_FEATURES.md
├── 03_DEVELOPMENT.md
├── 04_TROUBLESHOOTING.md
├── VERCEL_DEPLOY.md
├── SECURITY.md
└── BRANDING_GUIDE.md
```

---

## 🎯 Event Details

- **Event**: Sitecore Silver Anniversary (25 Years)
- **Location**: Tivoli, Copenhagen
- **Date**: June 11, 2026
- **Status**: ✅ Ready to deploy

---

## 📞 Need Help?

- **Setup?** → [docs/00_GETTING_STARTED.md](docs/00_GETTING_STARTED.md)
- **Architecture?** → [CLAUDE.md](./CLAUDE.md)
- **Issues?** → [docs/04_TROUBLESHOOTING.md](docs/04_TROUBLESHOOTING.md)
- **Deploy?** → [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)
- **Security?** → [docs/SECURITY.md](docs/SECURITY.md)

---

Built for the Sitecore Silver Celebration ✨
