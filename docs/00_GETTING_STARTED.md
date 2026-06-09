# Getting Started - AI Photo Booth

Welcome! This app runs as a **standalone event kiosk** or a **Sitecore Marketplace** app. This guide covers local setup for both modes.

> **Sitecore Marketplace?** See [05_MARKETPLACE.md](./05_MARKETPLACE.md) for App Studio registration.

## Prerequisites

Before you start, make sure you have installed:

- **Node.js** 18+ (Download from [nodejs.org](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **A code editor** (VS Code recommended: [code.visualstudio.com](https://code.visualstudio.com/))

### Verify Installation

Open a terminal and run:

```bash
node --version    # Should be v18+ (e.g., v18.18.0)
npm --version     # Should be 9+ (e.g., 9.8.0)
git --version     # Should show a version
```

## Step 1: Clone the Repository

```bash
cd C:\code\react
git clone <repository-url>
cd CopenhagenSilver
```

## Step 2: Install Dependencies

All required packages are listed in `package.json`. Install them with:

```bash
npm install
```

This will download and install:
- React 18 & Next.js 14
- Firebase SDK
- TypeScript
- Tailwind CSS
- Form validation (React Hook Form + Zod)
- Data fetching (TanStack Query)
- State management (Zustand)

**⏱️ First install takes 2-5 minutes depending on internet speed.**

## Step 3: Configure Environment Variables

1. Copy the example file:
   ```bash
   copy .env.example .env.local
   ```

2. **Edit `.env.local`** with your credentials:

   ```env
   # Firebase (get from Firebase Console)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=copenhagensilver
   
   # Gemini API
   GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the **CopenhagenSilver** project
3. Click **Project Settings** (gear icon)
4. Copy these values from "Your apps" → "Web":
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### Gemini API Key

Get from [Google AI Studio](https://aistudio.google.com/app/apikey):
```
GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### Choose a deployment mode

**Standalone kiosk (recommended for local dev):**
```env
NEXT_PUBLIC_STANDALONE_MODE=true
```

**Sitecore Silver event (Copenhagen 2026 branding):**
```env
APP_PRESET=sitecore-silver
```

**Secure APIs on public deploys:**
```env
API_SECRET=choose-a-long-random-string
```

See [05_MARKETPLACE.md](./05_MARKETPLACE.md) and [06_API_SECURITY.md](./06_API_SECURITY.md) for full details.

## Step 4: Start the Development Server

```bash
npm run dev
```

You should see:
```
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  
Ready in 1234ms
```

**Open your browser to [http://localhost:3000](http://localhost:3000)**

You should see the Sitecore Silver home page with silver theme and navigation buttons.

### Sitecore Marketplace local dev (HTTPS iframe)

When testing inside Sitecore Cloud Portal, use HTTPS so assets load in the HTTPS parent frame:

```bash
npm run dev:marketplace
# https://localhost:3001 — accept the self-signed cert once in the browser
```

Set App Studio **Deployment URL** to `https://localhost:3001` (match port exactly). See [05_MARKETPLACE.md](./05_MARKETPLACE.md).

## Admin screen (event staff)

**URL:** `/admin` — e.g. [http://localhost:3000/admin](http://localhost:3000/admin) (or your deploy origin + `/admin`).

1. Set in `.env.local`:
   ```env
   NEXT_PUBLIC_ENABLE_ADMIN=true
   ADMIN_SECRET=choose-a-strong-password-for-event-staff
   ```
2. Restart the dev server.
3. Open `/admin` and sign in with `ADMIN_SECRET`.
4. Staff can also reach Admin from the footer link on booth pages when admin is enabled.

Moderation uses `/api/admin/photos` (hide/show/delete gallery entries). See [06_API_SECURITY.md](./06_API_SECURITY.md).

## Step 5: Verify Everything Works

### Check the Home Page
- [ ] Page loads without errors
- [ ] "Sitecore Silver" title is visible
- [ ] "Create Photo" and "View Gallery" buttons are visible
- [ ] Silver/black color theme is applied

### Open Developer Tools (F12)
- [ ] Console has no red errors
- [ ] Network tab shows requests completing

## Common Issues

### Port 3000 Already in Use

If you get "Port 3000 in use" error:

```bash
# Windows - Find what's using port 3000
netstat -ano | findstr :3000

# Run on different port
npm run dev -- -p 3001
```

### Module Not Found Errors

If you see "Cannot find module" errors:

```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Firebase Connection Errors

If Firebase isn't connecting:

1. Check `.env.local` has correct credentials
2. Verify CopenhagenSilver project exists in Firebase Console
3. Check internet connection
4. Restart dev server: Press `Ctrl+C` then `npm run dev`

### TypeScript Errors

If you see TypeScript errors:

```bash
npm run type-check    # See all type errors
npm run lint          # See all linting issues
```

## Project Structure Quick Tour

```
CopenhagenSilver/
├── src/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and services
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   └── styles/           # CSS and themes
├── public/               # Static assets (images, icons)
├── docs/                 # Documentation
├── .env.local            # Your local environment variables
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Next Steps

- **[Architecture Guide](./01_ARCHITECTURE.md)** — Understand the project structure
- **[Feature Guides](./02_FEATURES.md)** — Learn about each feature
- **[Development Guide](./03_DEVELOPMENT.md)** — Common development tasks
- **[Troubleshooting](./04_TROUBLESHOOTING.md)** — Solutions to common problems

## Need Help?

1. **Check the docs folder** — Most questions are answered there
2. **Read CLAUDE.md** — Development guidance for experienced developers
3. **Check Terminal** — Error messages usually tell you what's wrong
4. **Ask in the team chat** — Reach out to other developers

---

**You're all set! 🎉 Ready to start building?**

See [Development Guide](./03_DEVELOPMENT.md) for the next steps.
