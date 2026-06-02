# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Cursor users:** See [AGENTS.md](./AGENTS.md) and `.cursor/rules/` + `.cursor/commands/` for the equivalent setup.

## Project Overview

**Sitecore Silver Photo Booth** - React/Next.js conversion of a Flutter photo booth app for the Sitecore 25-year anniversary event in Copenhagen (June 11, 2026).

This is an **event-focused photo experience** where users:
1. Enter their name/details
2. Capture or upload a photo
3. Select from themed backgrounds (Sitecore Silver aesthetic)
4. Choose creative AI prompts
5. Get AI-composited results (via Google Gemini)
6. Share/save/print results
7. Browse community gallery

**Reference codebase**: [Flutter version](C:\code\flutter\photo_booth_ai) - Use for feature reference and data models.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with React 18+
- **Language**: TypeScript
- **State Management**: TanStack Query (data fetching) + Zustand (client state)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini 2.5 Flash Image API
- **UI**: Tailwind CSS (event-branded styling)
- **Form**: React Hook Form + Zod
- **Media**: next/image, html2canvas (client printing)
- **Type Safety**: Zod for runtime validation

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── api/                # API routes (Gemini calls, Firebase operations)
│   │   ├── composit-image/ # POST Gemini compositing
│   │   └── upload-photo/   # POST Firebase upload
│   └── (photo-booth)/      # Route group for photo booth flow
│       ├── layout.tsx      # Shared layout for booth
│       ├── input/          # User input screen
│       ├── camera/         # Camera/upload screen
│       ├── backgrounds/    # Background selection
│       ├── prompts/        # Prompt selection
│       ├── processing/     # Loading/AI processing
│       ├── result/         # Final result + actions
│       └── gallery/        # Community gallery

├── components/
│   ├── photo-booth/        # Booth-specific components
│   │   ├── CameraCapture.tsx
│   │   ├── BackgroundSelector.tsx
│   │   ├── PromptSelector.tsx
│   │   ├── ProcessingLoader.tsx
│   │   └── ResultActions.tsx
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   └── common/             # Shared utilities
│       ├── Header.tsx
│       └── Footer.tsx

├── lib/
│   ├── firebase.ts         # Firebase initialization
│   ├── gemini.ts           # Gemini API client
│   ├── validators.ts       # Zod schemas for all forms/data
│   └── hooks.ts            # Custom React hooks

├── types/
│   └── index.ts            # TypeScript interfaces (Photo, Background, Prompt, etc.)

├── services/
│   ├── firebase/
│   │   ├── auth.ts
│   │   ├── storage.ts
│   │   └── firestore.ts
│   └── gemini/
│       └── image-compositing.ts

├── store/                  # Zustand stores
│   ├── photo-booth.ts      # Photo booth session state
│   └── gallery.ts          # Gallery filters/pagination

└── styles/
    ├── globals.css         # Tailwind + event branding
    └── theme.css           # CSS variables for Silver theme
```

## Key Concepts

### State Management Strategy

- **TanStack Query** (`useQuery`, `useMutation`): All Firebase operations (fetch photos, upload, delete)
- **Zustand**: Ephemeral client state (current selection, processing status, camera preview)
- **URL State**: Selected background/prompt stored in query params for persistence

**Example flow**:
```ts
// User selects background → update Zustand store
// Navigates to camera → reads from store
// Captures photo → calls API route (TanStack mutation)
// API calls Firebase directly → no client SDK exposure
```

### Photo Booth Session

Each user session has:
- `sessionId`: Unique ID (auto-generated on entry)
- `userName`: User's entered name
- `selectedBackground`: Background choice
- `selectedPrompt`: Prompt choice
- `originalPhoto`: Captured/uploaded image (stored in Firebase)
- `compositedPhoto`: Final AI result

Session persists in:
1. **Zustand store** while in booth
2. **Firestore** after processing (for gallery)
3. **Firebase Storage** for actual image files

### Firebase Rules & Security

- **Auth**: Anonymous + optional email collection (for sharing/printing)
- **Firestore** (`photobooth` collection):
  - Read: Public (gallery browsing)
  - Write: Authenticated only
  - Delete: Admin only
- **Storage** (`sitecore-silver/` path):
  - Read: Public (gallery images)
  - Write: Authenticated (upload size limit 10MB)

### API Routes Pattern

All client-side operations that touch Firebase go through API routes to:
1. Keep API keys server-side
2. Validate requests
3. Log/audit operations

Example:
```ts
// src/app/api/composit-image/route.ts
POST /api/composit-image
Body: { photo: base64, background: string, prompt: string }
Response: { compositedPhoto: base64, photoId: string }
```

## Common Development Tasks

### Running the app locally
```bash
npm run dev
# Opens http://localhost:3000
```

### Building for production
```bash
npm run build
npm run start
```

### Type checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run format
```

### Testing
```bash
npm test                    # Run all tests
npm test -- camera.test.ts  # Single test file
npm run test:watch         # Watch mode
```

### Deploying to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Reference to Flutter Architecture

When adding features, check the [Flutter version](C:\code\flutter\photo_booth_ai):

| Concept | Flutter | React/Next.js |
|---------|---------|---------------|
| State Management | Riverpod | Zustand + TanStack Query |
| Services | Service classes | lib/services + API routes |
| Models | Freezed + JSON serializable | types/ + Zod validators |
| Navigation | GoRouter | Next.js App Router |
| Firebase | flutter_firebase packages | firebase SDK (Node.js server-side) |
| UI Components | Flutter widgets | React + Tailwind components |

## Event-Specific Notes

**Sitecore Silver Branding**:
- Color palette: Silver (#C0C0C0), Black, White, minimal Nordic aesthetic
- Backgrounds: Tivoli venue, heritage imagery, minimal overlays
- Prompts: Focused on Sitecore history, 25-year narrative, innovation
- Responsive: Must work on large touchscreen kiosks (4K, portrait mode)

**Deployment**:
- Hosted on Firebase Hosting
- Event date: June 11, 2026
- Expected load: ~200 attendees over 4-6 hours
- Fallback: App works with cached images if network is slow

## Important Patterns

### Form Validation
All forms use React Hook Form + Zod:
```ts
const schema = z.object({
  userName: z.string().min(2).max(50),
  prompt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// In component:
const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Firebase Operations
Always use API routes + TanStack Query mutations:
```ts
// Component
const uploadMutation = useMutation({
  mutationFn: async (data) => {
    const res = await fetch('/api/upload-photo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
});

// Server-side
// src/app/api/upload-photo/route.ts
const bucket = admin.storage().bucket();
await bucket.file(path).save(buffer);
```

### Image Handling
- Use `next/image` for static assets
- Use `<img>` for dynamic gallery photos (from Firebase)
- Use `html2canvas` for client-side printing
- Gemini processes base64 encoded images

## Debugging Tips

**Firebase errors**: Check Firebase Console (Firestore rules, Storage CORS, Auth config)
**Gemini API errors**: Verify API key in environment variables, check quota
**Image not displaying**: CORS issue on Firebase Storage—verify bucket CORS config
**State not persisting**: Check Zustand hydration in browser console

## Security Considerations

- **Never commit** `.env.local` or Firebase credential files
- **API keys** exposed in frontend code should be Firebase Web SDK keys (restricted to this domain)
- **Gemini API key** must be server-side only (in API routes)
- **File uploads** validated on server (type + size)

---

**Last Updated**: June 1, 2026  
**Current Version**: 1.0.0 (Initial setup)
