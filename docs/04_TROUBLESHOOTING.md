# Troubleshooting Guide - Sitecore Silver Photo Booth

Solutions to common problems when developing this app.

## Problems When Starting Dev Server

### Problem: "Port 3000 in use"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Option 1: Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use a different port
npm run dev -- -p 3001
# Visit http://localhost:3001
```

### Problem: "Cannot find module" errors

**Error:**
```
Error: Cannot find module '@/types'
```

**Solution:**

```bash
# Reinstall dependencies
rm -r node_modules
npm install

# Or clear cache
npm cache clean --force
npm install
```

### Problem: "ENOENT: no such file or directory"

**Error:**
```
ENOENT: no such file or directory, open '.env.local'
```

**Solution:**

```bash
# Create .env.local file
copy .env.example .env.local

# Edit it with your Firebase credentials
```

## Problems with Firebase

### Problem: Firebase connection fails

**Error:**
```
Firebase: Error (auth/network-request-failed)
```

**Checklist:**
- [ ] Internet connection working?
- [ ] `.env.local` has correct Firebase credentials?
- [ ] Firebase project exists in [Firebase Console](https://console.firebase.google.com)?
- [ ] CopenhagenSilver project is selected?

**Solution:**

```bash
# Verify environment variables
cat .env.local

# Restart dev server
# Press Ctrl+C, then npm run dev
```

### Problem: "Permission denied" when uploading photos

**Error:**
```
Firebase: Error (permission-denied)
```

**Solution:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **CopenhagenSilver** project
3. Go to **Storage** → **Rules**
4. Check rules allow uploads:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /sitecore-silver/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth.token.admin == true;
    }
  }
}
```

### Problem: Images not loading from Firebase

**Error:**
```
CORS error when loading images from Firebase Storage
```

**Solution:**

Firebase Storage CORS needs configuration. Contact Firebase admin to set:

```json
[
  {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "HEAD", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## Problems with TypeScript

### Problem: "Type 'X' is not assignable to type 'Y'"

**Error:**
```
TS2322: Type 'string' is not assignable to type 'string | undefined'
```

**Solution:**

TypeScript is strict about types. Fix by:

```typescript
// ❌ Wrong
const name: string | undefined = "John"
const x: string = name  // Error!

// ✅ Right
const name: string | undefined = "John"
const x: string = name || "Unknown"  // Provide default

// ✅ Or use non-null assertion (if you know it's not null)
const x: string = name!
```

### Problem: "Cannot find name 'React'"

**Error:**
```
TS2304: Cannot find name 'React'
```

**Solution:**

Add React import or use the ` 'use client'` directive:

```typescript
// ✅ Solution 1: Import React
import React from 'react'

// ✅ Solution 2: Use 'use client' for client components
'use client'

import { useState } from 'react'
```

## Problems with React Components

### Problem: "Each child in a list should have a unique key prop"

**Error:**
```
Warning: Each child in a list should have a unique "key" prop.
```

**Solution:**

Always provide a `key` when rendering lists:

```typescript
// ❌ Wrong
{photos.map((photo) => (
  <div>{photo.name}</div>
))}

// ✅ Right
{photos.map((photo) => (
  <div key={photo.id}>{photo.name}</div>
))}
```

### Problem: Component doesn't update when state changes

**Error:**
```
State changed but component didn't re-render
```

**Solution:**

Use `useState` for component state:

```typescript
// ❌ Wrong - plain variable doesn't trigger re-render
let count = 0
function increment() {
  count++  // Doesn't trigger re-render!
}

// ✅ Right - useState triggers re-render
const [count, setCount] = useState(0)
function increment() {
  setCount(count + 1)  // Triggers re-render
}
```

### Problem: "Maximum update depth exceeded"

**Error:**
```
Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside render.
```

**Solution:**

Don't call state setters in render or useEffect without dependency array:

```typescript
// ❌ Wrong - infinite loop
function Component() {
  const [count, setCount] = useState(0)
  
  // This runs every render, which causes another state update
  setCount(count + 1)
  
  return <div>{count}</div>
}

// ✅ Right - use useEffect
function Component() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    setCount(count + 1)
  }, [])  // Only run once
  
  return <div>{count}</div>
}
```

### Problem: "Object is not a valid React child"

**Error:**
```
Objects are not valid as a React child (found: [object Object])
```

**Solution:**

Can't render objects directly. Convert to string or specific field:

```typescript
// ❌ Wrong
const user = { name: 'John' }
return <div>{user}</div>

// ✅ Right
return <div>{user.name}</div>

// ✅ Or convert to string
return <div>{JSON.stringify(user)}</div>
```

## Problems with API Routes

### Problem: API route not responding

**Error:**
```
Fetch failed or hangs indefinitely
```

**Solution:**

Check if file is in correct location:

```
✅ Correct: src/app/api/hello/route.ts
❌ Wrong: src/api/hello.ts
❌ Wrong: src/app/api/hello.ts (no route.ts)
```

### Problem: CORS error when calling API

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/...' from origin
'...' has been blocked by CORS policy
```

**Solution:**

API routes are on same domain, no CORS needed. Error is likely:
1. Typo in URL
2. API route doesn't exist
3. Using wrong HTTP method (GET vs POST)

```typescript
// Verify:
const res = await fetch('/api/hello', {
  method: 'POST',  // Make sure this matches route.ts
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

### Problem: "Request body is empty"

**Error:**
```
JSON.parse error when reading request body
```

**Solution:**

Must set Content-Type header:

```typescript
// ❌ Wrong
const res = await fetch('/api/hello', {
  method: 'POST',
  body: JSON.stringify(data)
  // Missing Content-Type
})

// ✅ Right
const res = await fetch('/api/hello', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

## Problems with Gemini AI

### Problem: "Invalid API key"

**Error:**
```
Error: Invalid API key (403)
```

**Solution:**

Check `.env.local`:

```
GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

Must be exact. Restart dev server after changing.

### Problem: "Quota exceeded"

**Error:**
```
Error: Quota exceeded (429)
```

**Solution:**

Gemini API has rate limits. Check [Google AI Console](https://aistudio.google.com/):

1. You've exceeded API quota
2. Wait and retry
3. Or check billing in Google Cloud Console

### Problem: "Invalid image format"

**Error:**
```
Error: Invalid image format
```

**Solution:**

Image must be JPEG or PNG. Check in API route:

```typescript
const imageBase64 = photo.split(',')[1]  // Remove "data:image/jpeg;base64," prefix

// Verify it's valid base64
if (!imageBase64 || imageBase64.length === 0) {
  throw new Error('Invalid image')
}
```

## Problems with Zustand Store

### Problem: Store state is undefined

**Error:**
```
TypeError: Cannot read property 'userName' of undefined
```

**Solution:**

Store may not be initialized. Check in component:

```typescript
// ❌ Wrong
const userName = usePhotoBoothStore((state) => state.session.userName)

// ✅ Right - with null check
const session = usePhotoBoothStore((state) => state.session)
const userName = session?.userName

// ✅ Or provide default
const userName = usePhotoBoothStore((state) => state.session?.userName || 'Guest')
```

### Problem: Store not updating in real-time

**Error:**
```
Store updated but component didn't re-render
```

**Solution:**

Make sure component is a client component:

```typescript
// Add at top of file
'use client'

import { usePhotoBoothStore } from '@/store/photo-booth'

export function MyComponent() {
  // Now works correctly
  const store = usePhotoBoothStore()
  return <div>{store.session?.userName}</div>
}
```

## Problems with Database/Firestore

### Problem: Can't see data in Firestore

**Error:**
```
Collection is empty or data not showing
```

**Solution:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **CopenhagenSilver** project
3. Go to **Firestore Database**
4. Check collection **photobooth**

If empty, no photos uploaded yet. Try uploading a test photo.

### Problem: "Collection doesn't exist"

**Error:**
```
Error: Firestore collection 'photobooth' doesn't exist
```

**Solution:**

Firestore creates collections when you first write data. After uploading first photo, collection appears automatically.

## General Debugging

### Clear All Caches

```bash
# Clear Next.js cache
rm -r .next

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Restart dev server
npm run dev
```

### View All Environment Variables

```bash
# Check what's loaded
cat .env.local

# In Node.js API route:
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
```

### Check All Logs

```bash
# 1. Browser console (F12)
# 2. Terminal running npm run dev
# 3. React DevTools (browser extension)
# 4. Network tab (F12) - see API calls
```

## Still Stuck?

**Checklist before asking for help:**
- [ ] Restarted dev server?
- [ ] Cleared cache (`rm -r .next && npm cache clean`)?
- [ ] Checked browser console (F12)?
- [ ] Checked terminal output?
- [ ] Verified `.env.local` has all required vars?
- [ ] Tried a fresh install (`npm install`)?

---

**More help:**
- [Getting Started](./00_GETTING_STARTED.md)
- [Architecture](./01_ARCHITECTURE.md)
- [Development Guide](./03_DEVELOPMENT.md)
