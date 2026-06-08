# Architecture Guide - AI Photo Booth

This guide explains how the app is structured and how different parts work together. The app supports **standalone** and **Sitecore Marketplace** modes from the same codebase.

## Big Picture: How the App Works

```
User Interface (React Components)
            ↓
Providers (Marketplace SDK + App Config)
            ↓
State Management (Zustand Stores)
            ↓
API Routes (Next.js Backend — secured when API_SECRET set)
            ↓
External Services (Firebase, Gemini AI, optional Sitecore CM)
```

## Runtime modes

| Mode | Trigger | SDK | Branding source |
|------|---------|-----|-----------------|
| Standalone | Direct URL or `NEXT_PUBLIC_STANDALONE_MODE=true` | Skipped | `APP_*` env vars + `/api/config` |
| Marketplace | Embedded in Sitecore iframe | `@sitecore-marketplace-sdk` | Same + optional CM |
| Sitecore Silver | `APP_PRESET=sitecore-silver` | Either | Copenhagen 2026 defaults |

**In Simple Terms:**
1. User opens the app → sees a **React Component**
2. User clicks a button → updates **Zustand State**
3. Component needs data → calls an **API Route**
4. API Route talks to **Firebase or Gemini AI**
5. Data comes back → component re-renders with new data

## Folder Structure Explained

### `src/app/` - Pages and API Routes

**Pages** (What users see):
```
app/
├── page.tsx              # Home page (/)
├── layout.tsx            # Root layout (shared by all pages)
├── (photo-booth)/        # Group of pages related to photo booth
│   ├── input/page.tsx    # User enters name
│   ├── camera/page.tsx   # Camera or upload photo
│   ├── backgrounds/page.tsx  # Choose background
│   ├── prompts/page.tsx   # Choose prompt
│   ├── processing/page.tsx   # Loading screen
│   ├── result/page.tsx    # Final photo
│   └── gallery/page.tsx   # View all photos
```

**API Routes** (Backend endpoints):
```
app/api/
├── config/route.ts           # GET - App branding, backgrounds, prompts
├── auth/session/route.ts     # GET - API session cookie (when secured)
├── composit-image/route.ts   # POST - Gemini image generation (secured)
├── upload-photo/route.ts     # POST - Save to Firebase (secured)
├── gallery/route.ts          # GET - Public gallery
├── sitecore/status/route.ts  # GET - CM credentials configured?
└── admin/*                   # Staff moderation (ADMIN_SECRET)
```

**Code split (Sitecore vs generic):**
```
src/lib/core/          # app-config, api-auth, api-client — no Sitecore dependency
src/lib/sitecore/      # authoring-api, brand-rules — optional
src/components/booth/  # BoothLogo, BoothBackdrop — generic
src/components/sitecore/ # SitecoreAiFlow — optional marketing
src/components/providers/ # MarketplaceProvider, AppConfigProvider
```

### `src/components/` - React Components

Reusable building blocks:

```
components/
├── photo-booth/          # Booth-specific components
│   ├── CameraCapture.tsx     # Camera preview and capture button
│   ├── BackgroundSelector.tsx # Choose background
│   ├── PromptSelector.tsx    # Choose AI prompt
│   ├── ProcessingLoader.tsx  # Loading animation
│   └── ResultActions.tsx     # Save/Share/Print buttons
├── ui/                   # Generic UI components
│   ├── Button.tsx        # Reusable button
│   ├── Card.tsx          # Reusable card container
│   ├── Modal.tsx         # Popup dialog
│   └── Input.tsx         # Text input field
└── common/               # Shared components
    ├── Header.tsx        # Top navigation
    └── Footer.tsx        # Bottom info
```

### `src/lib/` - Utilities and Services

Helper code:

```
lib/
├── firebase.ts           # Firebase initialization
├── validators.ts         # Zod validation schemas
├── hooks.ts             # Custom React hooks
├── gemini.ts            # Gemini API client
└── utils.ts             # Helper functions
```

### `src/store/` - State Management

Zustand stores (like a data container):

```
store/
├── photo-booth.ts       # Photo booth session state
│   - userName
│   - selectedBackground
│   - selectedPrompt
│   - capturedPhoto
│   - compositedPhoto
│   - isProcessing
└── gallery.ts          # Gallery filters and pagination
    - searchQuery
    - selectedCategory
    - currentPage
```

### `src/types/` - TypeScript Definitions

What data looks like:

```
types/
└── index.ts
    - PhotoBoothSession  - User's current session
    - Background        - Background image option
    - PhotoPrompt       - AI prompt
    - PhotoBoothPhoto   - Final saved photo
    - ApiResponse       - API response format
```

## How Data Flows Through the App

### Example 1: User Creates a Photo

```
1. HOME PAGE (page.tsx)
   User clicks "Create Photo" button

2. INPUT SCREEN (input/page.tsx)
   User enters name → clicks "Continue"
   ↓
   Component calls: usePhotoBoothStore.initializeSession()
   ↓
   Zustand store updates: session = { sessionId, userName, ... }

3. CAMERA SCREEN (camera/page.tsx)
   Component reads: usePhotoBoothStore.session
   User takes photo
   ↓
   Component calls: useCameraCapture() hook
   ↓
   Photo stored in: usePhotoBoothStore.capturedPhoto = base64

4. BACKGROUND SELECTION (backgrounds/page.tsx)
   Component reads: usePhotoBoothStore.capturedPhoto
   User selects background
   ↓
   Component calls: usePhotoBoothStore.setSelectedBackground()
   ↓
   Zustand updates: selectedBackground = { id, name, ... }

5. PROMPT SELECTION (prompts/page.tsx)
   Component reads: usePhotoBoothStore
   User selects prompt
   ↓
   Component calls: usePhotoBoothStore.setSelectedPrompt()
   ↓
   Zustand updates: selectedPrompt = { id, title, ... }

6. PROCESSING SCREEN (processing/page.tsx)
   Component shows loading animation
   ↓
   Component calls: useMutation to POST /api/composit-image
   ↓
   API ROUTE HANDLER (api/composit-image/route.ts)
   - Receives: photo, background, prompt
   - Calls: Google Gemini AI
   - Returns: compositedPhoto (base64)

7. RESULT SCREEN (result/page.tsx)
   Component receives: compositedPhoto
   ↓
   User clicks "Save to Gallery"
   ↓
   Component calls: useMutation to POST /api/upload-photo
   ↓
   API ROUTE HANDLER (api/upload-photo/route.ts)
   - Saves photo to Firebase Storage
   - Saves metadata to Firestore
   - Returns: photoId, photoCode, photoUrl

8. RESULT DISPLAYED
   Component shows final photo with sharing options
```

## Key Concepts

### 1. React Components

A component is like a function that returns UI:

```typescript
// Simple component
export function MyButton() {
  return <button className="bg-silver">Click me</button>
}

// Component with state
export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### 2. Zustand Store

A global state container (like a data warehouse):

```typescript
// Create a store
const useStore = create((set) => ({
  name: 'John',
  setName: (newName) => set({ name: newName }),
}))

// Use in component
function MyComponent() {
  const name = useStore((state) => state.name)
  const setName = useStore((state) => state.setName)
  
  return <button onClick={() => setName('Jane')}>Hi {name}</button>
}
```

### 3. API Routes

A backend endpoint in Next.js:

```typescript
// src/app/api/hello/route.ts
export async function GET(request: Request) {
  return Response.json({ message: 'Hello!' })
}

export async function POST(request: Request) {
  const data = await request.json()
  // Do something with data
  return Response.json({ success: true })
}
```

### 4. TanStack Query (useQuery/useMutation)

For fetching data from API:

```typescript
// GET data
const { data, isLoading } = useQuery({
  queryKey: ['photos'],
  queryFn: async () => {
    const res = await fetch('/api/gallery')
    return res.json()
  }
})

// POST data
const { mutate, isPending } = useMutation({
  mutationFn: async (photo) => {
    const res = await fetch('/api/upload-photo', {
      method: 'POST',
      body: JSON.stringify(photo)
    })
    return res.json()
  }
})
```

## Data Models

### PhotoBoothSession
Represents a user's current session:
```typescript
{
  sessionId: "session_1234567890",
  userName: "John Doe",
  userEmail: "john@example.com",
  createdAt: Date
}
```

### Background
A background image option:
```typescript
{
  id: "heritage",
  name: "Sitecore Heritage",
  imageUrl: "...",
  description: "...",
  category: "heritage"
}
```

### PhotoPrompt
An AI transformation prompt:
```typescript
{
  id: "25-years",
  title: "25 Years Strong",
  fullPrompt: "Show celebrating 25 years...",
  category: "heritage"
}
```

### PhotoBoothPhoto
A final saved photo:
```typescript
{
  id: "photo_abc123",
  sessionId: "session_1234567890",
  userName: "John Doe",
  originalPhotoUrl: "...",
  compositedPhotoUrl: "...",
  backgroundId: "heritage",
  promptId: "25-years",
  photoCode: "SILVER2024001",
  createdAt: Date
}
```

## Firebase Integration

### Collections (Firestore)
```
firestore/
└── photobooth/     (collection)
    └── {photoId}   (document)
        ├── id
        ├── userName
        ├── backgroundId
        ├── promptId
        ├── compositedPhotoUrl
        ├── createdAt
        └── ...
```

### Storage (Firebase Cloud Storage)
```
storage/
└── sitecore-silver/
    ├── {sessionId}/
    │   ├── original_{timestamp}.jpg
    │   └── composited_{timestamp}.jpg
```

## Gemini AI Integration

The Gemini API is called from the **server-side** (API route) for security:

```
Client → POST /api/composit-image
         {photo: base64, background: string, prompt: string}
         ↓
API Route → Google Gemini API
           {photo, background, prompt}
           ↓
Gemini → Processes image
         ↓
API Route → Response {compositedPhoto: base64}
           ↓
Client → Updates UI with result
```

## Security Model

**Public (Accessible to anyone):**
- Home page
- Gallery viewing

**Authenticated (Need to be logged in):**
- Create photo
- Upload photo

**Admin Only:**
- Delete photos
- View analytics

**Secret (Never exposed to client):**
- Gemini API key (server-side only)
- Firebase Service Account credentials (server-side only)
- Database write permissions (Firebase rules)

---

**Next Steps:**
- [Feature Guides](./02_FEATURES.md) — What each feature does
- [Development Guide](./03_DEVELOPMENT.md) — How to write code
- [Troubleshooting](./04_TROUBLESHOOTING.md) — Fix common issues
