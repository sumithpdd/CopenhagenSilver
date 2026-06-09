# Features Guide - Sitecore Silver Photo Booth

This guide explains what each feature does and how it works.

## Overview

The app consists of these main features:

1. **User Input** - Collect user information
2. **Camera** - Capture or upload a photo
3. **Background Selection** - Choose a themed background
4. **Prompt Selection** - Choose an AI transformation
5. **AI Processing** - Gemini combines photo with background and applies prompt
6. **Result Display** - Show final photo with actions
7. **Gallery** - Browse all photos created

## Feature 1: Home Page

**File:** `src/app/page.tsx`

**What it does:**
- Landing page when user opens the app
- Shows Sitecore Silver branding (silver theme)
- Two main actions: "Create Photo" and "View Gallery"

**User Journey:**
```
Opens app → Home page → User clicks "Create Photo"
                      ↓
                   Go to Input Screen
```

**Screenshot:**
```
┌─────────────────────────────────────┐
│     Sitecore Silver                 │
│     25 Years of Innovation          │
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │     📸       │  │     🖼️       ││
│  │ Create Photo │  │ View Gallery ││
│  └──────────────┘  └──────────────┘│
│                                     │
│  📍 Tivoli, Copenhagen              │
│  📅 June 11, 2026                   │
└─────────────────────────────────────┘
```

## Feature 2: User Input Screen

**File:** `src/app/(photo-booth)/input/page.tsx`

**What it does:**
- Collects user's name (required)
- Collects user's email (optional)
- Validates input using Zod
- Creates a unique session ID
- Saves to Zustand store

**Form Fields:**
```
┌─────────────────────────────┐
│ What's your name?           │
│ ┌───────────────────────┐   │
│ │ John Doe              │   │
│ └───────────────────────┘   │
│                             │
│ Email (optional)            │
│ ┌───────────────────────┐   │
│ │ john@example.com      │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │  Continue             │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

**Data Saved:**
```typescript
{
  sessionId: "session_1234567890_abc123",
  userName: "John Doe",
  userEmail: "john@example.com",
  createdAt: Date
}
```

## Feature 3: Camera Capture

**File:** `src/components/photo-booth/CameraCapture.tsx`

**What it does:**
- Accesses device camera
- Shows live camera preview
- Captures photo from camera
- OR allows uploading from device gallery

**User Can:**
- [ ] Take a photo with camera
- [ ] Flip camera (front/back on mobile)
- [ ] Upload from device gallery
- [ ] Retake if not happy

**Screen Layout:**
```
┌─────────────────────────────┐
│ Ready to be photographed?   │
│                             │
│  ┌─────────────────────┐    │
│  │  [Camera Preview]   │    │
│  │                     │    │
│  │  Tap to Capture     │    │
│  └─────────────────────┘    │
│                             │
│  [📁 Upload] [🔄 Flip]      │
└─────────────────────────────┘
```

**How it works:**
1. Component requests camera permission
2. Shows live video stream
3. User taps to capture
4. Converts to image (base64)
5. Saves to Zustand: `usePhotoBoothStore.capturedPhoto`

## Feature 4: Background Selection

**File:** `src/components/photo-booth/BackgroundSelector.tsx`

**What it does:**
- Shows 3 background images
- Allows user to select one
- Each background represents a theme:
  - **Heritage** - Sitecore 25-year history
  - **Celebration** - Celebrating milestone
  - **Innovation** - Future and AI

**Available Backgrounds:**
```typescript
[
  {
    id: "heritage",
    name: "Sitecore Heritage",
    description: "25 years of innovation from Denmark",
    category: "heritage",
    imageUrl: "..."
  },
  {
    id: "celebration",
    name: "Celebrating Together",
    description: "Community and milestone",
    category: "celebration",
    imageUrl: "..."
  },
  {
    id: "innovation",
    name: "Future Ready",
    description: "AI and digital innovation",
    category: "innovation",
    imageUrl: "..."
  }
]
```

**Screen:**
```
┌─────────────────────────────────────┐
│ Choose Your Background              │
│                                     │
│ ┌─────────────┐ ┌─────────────┐   │
│ │  Heritage   │ │ Celebration │   │
│ │    [IMG]    │ │    [IMG]    │   │
│ └─────────────┘ └─────────────┘   │
│                                     │
│ ┌─────────────┐                    │
│ │ Innovation  │                    │
│ │   [IMG]     │                    │
│ └─────────────┘                    │
│                                     │
│        [Continue]                   │
└─────────────────────────────────────┘
```

**Data Saved:**
```typescript
usePhotoBoothStore.setSelectedBackground({
  id: "heritage",
  name: "Sitecore Heritage",
  ...
})
```

## Feature 5: Prompt Selection

**File:** `src/components/photo-booth/PromptSelector.tsx`

**What it does:**
- Shows 12+ AI prompts
- Grouped by category
- User selects a prompt
- Prompt will be sent to Gemini AI

**Available Prompts:**

### Heritage Category
- "Celebrating 25 Years of Sitecore"
- "From Denmark to the World"
- "Founders Meet the Future"

### Celebration Category
- "Celebrating with Customers"
- "Milestone Moment"
- "25 Years Strong Together"

### Innovation Category
- "Building the Future with AI"
- "Digital Transformation Pioneer"
- "Next Generation Sitecore"

### Fun Category
- "Tech Superhero"
- "Developer's Dream"

**Screen:**
```
┌──────────────────────────────────┐
│ Choose Your Transformation       │
│                                  │
│ Filter: [All] [Heritage] [...] │
│                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────┐│
│ │ 25 Years│ │ From DK │ │ ...││
│ │         │ │ to World│ │    ││
│ └─────────┘ └─────────┘ └─────┘│
│                                  │
│ ┌─────────┐ ┌─────────┐        │
│ │ Founders│ │ Celebrate         │
│ │  Meet   │ │ Together│        │
│ └─────────┘ └─────────┘        │
│                                  │
│       [Continue]                 │
└──────────────────────────────────┘
```

**Custom Prompt Option:**
Users can also write their own prompt:
```
Custom: [Text input field]
"Show me as a Sitecore pioneer"
```

## Feature 6: Processing/Loading

**File:** `src/components/photo-booth/ProcessingLoader.tsx`

**What it does:**
- Shows loading animation while Gemini AI processes
- Displays current step (uploading, compositing, saving)
- Error handling if something fails

**What Happens:**
```
1. User clicks "Create Photo"
2. Photo + Background + Prompt sent to /api/composit-image
3. Processing screen shows loading animation
4. Gemini AI processes (5-30 seconds)
5. Photo returned to client
6. Result screen shown
```

**Screen:**
```
┌─────────────────────────────┐
│  Creating Your Photo...     │
│                             │
│     ⏳ Loading Animation    │
│                             │
│  Current Step:              │
│  Uploading... 50%           │
│  ▓▓▓▓▓░░░░░░░░░░░░ 50%     │
│                             │
│  Don't close this window    │
└─────────────────────────────┘
```

## Feature 7: Result Display

**File:** `src/app/(photo-booth)/result/page.tsx`

**What it does:**
- Shows the final AI-processed photo
- Displays photo code (unique ID)
- Provides action buttons

**Actions Available:**
- **Save to Gallery** - Uploads to Firebase for sharing
- **Download** - Save to device
- **Print** - Generate PDF
- **Share** - Copy link for social media
- **Create Another** - Start over

**Screen:**
```
┌────────────────────────────┐
│ Your Photo: SILVER2024001  │
│                            │
│  ┌──────────────────────┐  │
│  │  [Composited Photo]  │  │
│  │   (with background   │  │
│  │   and AI effect)     │  │
│  └──────────────────────┘  │
│                            │
│ ┌────┐ ┌────┐ ┌────┐     │
│ │Save│ │Down│ │Prnt│     │
│ └────┘ └────┘ └────┘     │
│ ┌────┐ ┌────┐            │
│ │Shre│ │New │            │
│ └────┘ └────┘            │
└────────────────────────────┘
```

**Data Stored in Firebase:**
```typescript
{
  id: "photo_abc123",
  sessionId: "session_1234567890_abc123",
  userName: "John Doe",
  originalPhotoUrl: "https://storage.../original.jpg",
  compositedPhotoUrl: "https://storage.../composited.jpg",
  backgroundId: "heritage",
  promptId: "25-years",
  photoCode: "SILVER2024001",
  createdAt: Date
}
```

## Feature 8: Community Gallery

**File:** `src/app/(photo-booth)/gallery/page.tsx`

**What it does:**
- Shows all photos created by users
- Search by photo code or username
- Filter by category
- Pagination for browsing

**Features:**
- [ ] Browse all photos in grid
- [ ] Search by Photo Code (e.g., "SILVER2024001")
- [ ] Search by Username
- [ ] Filter by Background Category
- [ ] Pagination (20 photos per page)
- [ ] Responsive on mobile

**Screen:**
```
┌────────────────────────────────┐
│ Community Gallery              │
│                                │
│ [Search...] [Filter ▼]        │
│                                │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ │Img1│ │Img2│ │Img3│ │Img4│  │
│ │John│ │Jane│ │Mike│ │Lisa│  │
│ └────┘ └────┘ └────┘ └────┘  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ │Img5│ │Img6│ │Img7│ │Img8│  │
│ │Tom │ │Amy │ │...│ │... │  │
│ └────┘ └────┘ └────┘ └────┘  │
│                                │
│ [< Previous] [1 2 3] [Next >] │
└────────────────────────────────┘
```

**API Endpoint:**
```
GET /api/gallery?search=john&category=heritage&page=1&limit=20
```

## Feature 9: Admin (staff moderation)

**File:** `src/app/admin/page.tsx`

**URL:** `/admin` (local: `http://localhost:3000/admin`; production: `https://your-deploy-url/admin`)

**What it does:**
- Password gate for event staff (`ADMIN_SECRET`)
- Lists photos from Firestore (`photobooth` collection)
- Filter by visibility (all / public / hidden)
- Hide, show, or delete photos from the community gallery

**Configuration:**
```env
NEXT_PUBLIC_ENABLE_ADMIN=true
ADMIN_SECRET=choose-a-strong-password-for-event-staff
```

Without `ADMIN_SECRET`, the login API returns 503 and the page cannot authenticate.

**Footer link:** When `NEXT_PUBLIC_ENABLE_ADMIN=true`, booth pages show an **Admin** link in the footer.

**API:**
- `POST /api/admin/login` — body `{ "password": "<ADMIN_SECRET>" }`
- `GET /api/admin/photos` — list (requires admin cookie)
- `PATCH /api/admin/photos/[id]` — update visibility / moderation
- `DELETE /api/admin/photos/[id]` — remove photo and Storage files

## API Endpoints Reference

### 1. Composit Image (AI Processing)
```
POST /api/composit-image

Request Body:
{
  photo: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  background: "heritage",
  prompt: "Celebrating 25 years..."
}

Response:
{
  success: true,
  data: {
    compositedPhoto: "data:image/jpeg;base64,...",
    photoId: "photo_abc123"
  }
}
```

### 2. Upload Photo
```
POST /api/upload-photo

Request Body (FormData):
{
  sessionId: "session_...",
  userName: "John Doe",
  originalPhoto: "data:image/jpeg;base64,...",
  backgroundId: "heritage",
  promptId: "25-years"
}

Response:
{
  success: true,
  data: {
    photoId: "photo_abc123",
    photoCode: "SILVER2024001",
    compositedPhotoUrl: "https://storage.../composited.jpg"
  }
}
```

### 3. Get Gallery
```
GET /api/gallery?search=john&category=heritage&page=1&limit=20

Response:
{
  success: true,
  data: {
    photos: [...],
    total: 45,
    hasMore: true
  }
}
```

---

**Next Steps:**
- [Development Guide](./03_DEVELOPMENT.md) — How to modify features
- [Troubleshooting](./04_TROUBLESHOOTING.md) — Fix issues
