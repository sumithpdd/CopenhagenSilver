# Development Guide - Sitecore Silver Photo Booth

This guide explains how to write code for this project.

## Daily Development Workflow

### Starting Your Day

```bash
# 1. Open terminal in project directory
cd C:\code\react\CopenhagenSilver

# 2. Start dev server
npm run dev

# 3. Open browser
# Visit http://localhost:3000
```

**npm scripts:**
| Command | Purpose |
|---------|---------|
| `npm run dev` | Standard dev server (`http://localhost:3000`) |
| `npm run dev:https` | HTTPS on port 3000 (self-signed cert) |
| `npm run dev:marketplace` | HTTPS on port **3001** — use with Sitecore Marketplace iframe |

**Dev server will:**
- Watch for file changes
- Auto-reload browser when you save
- Show TypeScript errors
- Show React errors

### Making Code Changes

When you modify a file:
1. TypeScript checks types → errors in terminal
2. Save file → browser auto-refreshes
3. Check browser for changes
4. If error: look at terminal and browser console

### Stopping Dev Server

```bash
# Press Ctrl+C in terminal
```

## Project Structure for Developers

### Adding a New Page

**Task:** Add a new page at `/test`

**Steps:**

1. Create folder: `src/app/test/`
2. Create file: `src/app/test/page.tsx`
3. Write component:

```typescript
// src/app/test/page.tsx
export default function TestPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Test Page</h1>
      <p>Hello World!</p>
    </main>
  )
}
```

4. Visit `http://localhost:3000/test` in browser

**Next.js Magic:** File at `src/app/test/page.tsx` → automatically creates route `/test`

### Adding a New Component

**Task:** Create a button component

**Steps:**

1. Create file: `src/components/ui/NewButton.tsx`
2. Write component:

```typescript
// src/components/ui/NewButton.tsx
interface NewButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
}

export function NewButton({ label, onClick, disabled }: NewButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-silver-400 text-black rounded hover:bg-silver-500 disabled:opacity-50"
    >
      {label}
    </button>
  )
}
```

3. Use in a page:

```typescript
// In any page.tsx
import { NewButton } from '@/components/ui/NewButton'

export default function MyPage() {
  return <NewButton label="Click Me" onClick={() => alert('Clicked!')} />
}
```

### Adding a New API Route

**Task:** Create an API endpoint at `POST /api/hello`

**Steps:**

1. Create folder: `src/app/api/hello/`
2. Create file: `src/app/api/hello/route.ts`
3. Write handler:

```typescript
// src/app/api/hello/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  return Response.json({
    success: true,
    message: `Hello ${data.name}!`
  })
}
```

4. Call from client:

```typescript
// In a component
const response = await fetch('/api/hello', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
})

const result = await response.json()
console.log(result) // { success: true, message: "Hello John!" }
```

## Writing React Components

### Basic Component (No State)

```typescript
// src/components/WelcomeCard.tsx
interface WelcomeCardProps {
  title: string
  description: string
}

export function WelcomeCard({ title, description }: WelcomeCardProps) {
  return (
    <div className="bg-silver-100 p-4 rounded">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
```

**Using it:**
```typescript
<WelcomeCard 
  title="Welcome" 
  description="This is a greeting" 
/>
```

### Component with State (useState)

```typescript
// src/components/Counter.tsx
'use client'  // Need this for client-side features

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-silver-400 rounded"
      >
        Increment
      </button>
    </div>
  )
}
```

### Component Using Zustand Store

```typescript
// src/components/PhotoInfo.tsx
'use client'

import { usePhotoBoothStore } from '@/store/photo-booth'

export function PhotoInfo() {
  const session = usePhotoBoothStore((state) => state.session)
  
  return (
    <div>
      <p>User: {session?.userName}</p>
      <p>Session: {session?.sessionId}</p>
    </div>
  )
}
```

### Component with API Call

```typescript
// src/components/PhotosList.tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export function PhotosList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const res = await fetch('/api/gallery')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })
  
  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  
  return (
    <div>
      {data?.map((photo) => (
        <img key={photo.id} src={photo.compositedPhotoUrl} />
      ))}
    </div>
  )
}
```

## Using Zustand for State

### Reading State

```typescript
// In a component
const userName = usePhotoBoothStore((state) => state.session?.userName)
```

### Updating State

```typescript
// In a component
const setBackgroundId = usePhotoBoothStore((state) => state.setSelectedBackground)

// Use it
setBackgroundId({ id: 'heritage', name: '...', ... })
```

### Full Example

```typescript
'use client'

import { usePhotoBoothStore } from '@/store/photo-booth'

export function SessionDisplay() {
  const session = usePhotoBoothStore((state) => state.session)
  const initializeSession = usePhotoBoothStore((state) => state.initializeSession)
  const resetSession = usePhotoBoothStore((state) => state.resetSession)
  
  return (
    <div>
      {session ? (
        <>
          <p>User: {session.userName}</p>
          <button onClick={() => resetSession()}>
            Reset
          </button>
        </>
      ) : (
        <button onClick={() => initializeSession('John Doe')}>
          Start Session
        </button>
      )}
    </div>
  )
}
```

## Form Validation with Zod

### Define Schema

```typescript
// In lib/validators.ts
import { z } from 'zod'

export const photoFormSchema = z.object({
  userName: z.string().min(2, 'Name must be at least 2 characters'),
  userEmail: z.string().email('Invalid email').optional(),
})

export type PhotoFormData = z.infer<typeof photoFormSchema>
```

### Use in Component

```typescript
// In a component
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { photoFormSchema, type PhotoFormData } from '@/lib/validators'

export function PhotoForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PhotoFormData>({
    resolver: zodResolver(photoFormSchema),
  })
  
  const onSubmit = (data: PhotoFormData) => {
    console.log('Form valid:', data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register('userName')}
        placeholder="Your name"
      />
      {errors.userName && <p className="text-red-500">{errors.userName.message}</p>}
      
      <input 
        {...register('userEmail')}
        placeholder="Email (optional)"
      />
      {errors.userEmail && <p className="text-red-500">{errors.userEmail.message}</p>}
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Using TypeScript

### Basic Types

```typescript
// Define what data looks like
interface Photo {
  id: string
  userName: string
  compositedPhotoUrl: string
  createdAt: Date
}

// Use in function
function displayPhoto(photo: Photo) {
  console.log(`Photo by ${photo.userName}`)
}

// Use in component
interface PhotoCardProps {
  photo: Photo
}

function PhotoCard({ photo }: PhotoCardProps) {
  return <img src={photo.compositedPhotoUrl} alt={photo.userName} />
}
```

### Optional Properties

```typescript
interface User {
  name: string
  email?: string  // Optional
  age: number | undefined  // Can be undefined
}
```

## Common Tasks

### Task 1: Add a Button to a Page

**File:** `src/app/test/page.tsx`

```typescript
'use client'

import { useState } from 'react'

export default function TestPage() {
  const [clicked, setClicked] = useState(false)
  
  return (
    <div className="p-8">
      <h1>Test Page</h1>
      
      <button
        onClick={() => setClicked(!clicked)}
        className="px-4 py-2 bg-silver-400 text-black rounded"
      >
        Click Me
      </button>
      
      {clicked && <p>You clicked the button!</p>}
    </div>
  )
}
```

### Task 2: Fetch Data from API

**File:** `src/components/DataDisplay.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'

export function DataDisplay() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/gallery')
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

### Task 3: Update State

**File:** `src/components/SessionManager.tsx`

```typescript
'use client'

import { usePhotoBoothStore } from '@/store/photo-booth'

export function SessionManager() {
  const session = usePhotoBoothStore((state) => state.session)
  const initializeSession = usePhotoBoothStore((state) => state.initializeSession)
  
  return (
    <div className="p-4 border rounded">
      <h3>Session Manager</h3>
      
      {!session ? (
        <input
          type="text"
          placeholder="Enter your name"
          onBlur={(e) => {
            if (e.target.value) {
              initializeSession(e.target.value)
            }
          }}
        />
      ) : (
        <p>Welcome, {session.userName}!</p>
      )}
    </div>
  )
}
```

## Styling with Tailwind CSS

### Common Classes

```typescript
// Layout
className="flex flex-col gap-4"    // Vertical stack with spacing
className="flex flex-row justify-between"  // Horizontal, space between
className="grid grid-cols-3 gap-4"  // 3-column grid

// Colors
className="bg-silver-400"          // Silver background
className="text-white"              // White text
className="border border-silver-300" // Silver border

// Sizing
className="w-full h-screen"         // Full width and height
className="p-4"                     // Padding all sides
className="px-4 py-2"              // Padding X and Y
className="rounded"                 // Rounded corners
className="rounded-lg"              // More rounded

// Effects
className="hover:bg-silver-500"     // On hover
className="disabled:opacity-50"     // When disabled
className="transition-all duration-300"  // Animation

// Responsive
className="text-base md:text-lg lg:text-2xl"  // Different sizes on different screens
className="hidden md:block"         // Hide on small, show on medium+
```

## Common Commands

```bash
# Start dev server
npm run dev

# Type check (find TypeScript errors)
npm run type-check

# Format code
npm run format

# Lint code (find style issues)
npm run lint

# Build for production
npm run build

# Run tests
npm test
```

## Debugging Tips

### 1. Console Logging

```typescript
function MyComponent() {
  console.log('Component mounted')
  return <div>Hello</div>
}
```

Open browser DevTools: `F12` → Console tab

### 2. React DevTools

Install [React DevTools extension](https://chrome.google.com/webstore/detail/react-developer-tools/) for browser.

Helps see:
- Component tree
- Props
- State
- Performance

### 3. Network Tab (F12)

Check API calls:
1. Open DevTools → Network tab
2. Reload page or perform action
3. See all requests and responses

### 4. TypeScript Errors

Terminal shows TypeScript errors.  
Fix them before they become runtime bugs.

```bash
npm run type-check  # List all type errors
```

## Testing (Optional)

### Run Tests

```bash
npm test
```

### Write a Simple Test

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { NewButton } from '../ui/NewButton'

describe('NewButton', () => {
  it('renders with label', () => {
    render(<NewButton label="Click Me" />)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
})
```

---

**Next Steps:**
- [Troubleshooting](./04_TROUBLESHOOTING.md) — Fix common problems
- [Feature Guides](./02_FEATURES.md) — Details on each feature
