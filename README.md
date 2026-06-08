# AI Photo Booth 📸

AI-powered event photo booth — runs as a **Sitecore Marketplace** app or **standalone** kiosk.

**Built with**: React 18 + Next.js 14 + TypeScript + Vercel + Google Gemini AI + Sitecore Marketplace SDK

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
| **[CLAUDE.md](./CLAUDE.md)** | 👨‍💻 Developer guide (Claude Code) |
| **[AGENTS.md](./AGENTS.md)** | 🤖 Developer guide (Cursor) |
| **[.cursor/rules/](./.cursor/rules/)** | Auto-applied Cursor rules |
| **[.cursor/commands/](./.cursor/commands/)** | Cursor slash commands (`/verify`, `/safety-check`) |
| **[docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)** | 🚀 Deploy to Vercel |
| **[docs/SECURITY.md](docs/SECURITY.md)** | 🔐 Security best practices |
| **[docs/BRANDING_GUIDE.md](docs/BRANDING_GUIDE.md)** | 🎨 Design system & colors |
| **[docs/05_MARKETPLACE.md](docs/05_MARKETPLACE.md)** | 🏪 Sitecore Marketplace setup |
| **[docs/06_API_SECURITY.md](docs/06_API_SECURITY.md)** | 🔒 Secure API patterns |

---

## ⚡ Quick Start

### Standalone (local kiosk)

```bash
npm install
cp .env.example .env.local
# Add GOOGLE_GEMINI_API_KEY + Firebase Admin credentials
# Optional: APP_PRESET=sitecore-silver for Copenhagen event branding
echo "NEXT_PUBLIC_STANDALONE_MODE=true" >> .env.local
npm run dev
```

### Sitecore Marketplace

1. Register app in **App Studio** (extension point: **Standalone**).
2. Set deployment URL to `http://localhost:3000`.
3. Configure `.env.local` (see `.env.example`).
4. `npm run dev` and open from Cloud Portal.

**Full guides:** [docs/00_GETTING_STARTED.md](docs/00_GETTING_STARTED.md) · [docs/05_MARKETPLACE.md](docs/05_MARKETPLACE.md)

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
├── app/                    # Pages + API routes (all actions via /api/*)
├── components/
│   ├── booth/              # Generic booth UI (works without Sitecore)
│   ├── sitecore/           # Optional Sitecore marketing modules
│   └── providers/          # Marketplace SDK + app config
├── lib/
│   ├── core/               # Config, API auth, API client
│   └── sitecore/           # Authoring API, brand rules (optional)
├── store/                  # Zustand session state
└── data/                   # Default backgrounds & prompts

docs/
├── 05_MARKETPLACE.md       # Sitecore Marketplace setup
├── 06_API_SECURITY.md      # Secure API guide
└── … (see table above)
```

---

## 🎯 Deployment modes

| Mode | Use case | Config |
|------|----------|--------|
| **Standalone** | Event kiosk, local dev | `NEXT_PUBLIC_STANDALONE_MODE=true` |
| **Marketplace** | Sitecore Cloud Portal app | App Studio + deployment URL |
| **Sitecore Silver** | Copenhagen 2026 event | `APP_PRESET=sitecore-silver` |

---

## 📞 Need Help?

- **Marketplace?** → [docs/05_MARKETPLACE.md](docs/05_MARKETPLACE.md)
- **API security?** → [docs/06_API_SECURITY.md](docs/06_API_SECURITY.md)
- **Setup?** → [docs/00_GETTING_STARTED.md](docs/00_GETTING_STARTED.md)
- **Architecture?** → [CLAUDE.md](./CLAUDE.md)
- **Issues?** → [docs/04_TROUBLESHOOTING.md](docs/04_TROUBLESHOOTING.md)
- **Deploy?** → [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)
- **Security?** → [docs/SECURITY.md](docs/SECURITY.md)

---

Built for the Sitecore Silver Celebration ✨
