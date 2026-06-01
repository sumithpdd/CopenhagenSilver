# 🎨 Sitecore Silver Branding Guide

**Event:** Sitecore 25-Year Anniversary Celebration  
**Location:** Tivoli, Copenhagen  
**Date:** June 11, 2026

---

## Color Palette

### Primary Colors

| Color | Usage | RGB | Hex |
|-------|-------|-----|-----|
| **Silver 400** | Accent, buttons, highlights | (184, 184, 184) | `#b8b8b8` |
| **Silver 500** | Hover states, secondary | (160, 160, 160) | `#a0a0a0` |
| **Silver 600** | Dark accents | (128, 128, 128) | `#808080` |
| **Dark** | Background, text dark | (26, 26, 26) | `#1a1a1a` |
| **White** | Text on dark, primary text | (255, 255, 255) | `#ffffff` |

### Accent Colors

| Color | Usage | Hex |
|-------|-------|-----|
| **Gold** | Premium accents, highlights | `#d4af37` |
| **Sitecore Purple** | Subtle accent tint | `#c9b4cc` |

### Transparency & Opacity

- **Glass effect:** 0.1 opacity on silver over dark background
- **Glow effect:** 0.05-0.3 opacity for radial gradients
- **Overlay:** 0.8-0.95 opacity for dark overlays

---

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| **H1** | 3.75rem (60px) | 700 | Page titles |
| **H2** | 2.25rem (36px) | 700 | Section titles |
| **Body** | 1rem (16px) | 400 | Regular text |
| **Small** | 0.875rem (14px) | 400 | Helper text |
| **XSmall** | 0.75rem (12px) | 400 | Labels, captions |

### Font Weights

- **Bold:** 700 (headings, CTAs)
- **Regular:** 400 (body text)
- **Light:** 300 (taglines)

---

## Logo & Assets

### Logo

**File:** `public/logo.jpg`  
**Size:** 400x400px  
**Format:** JPEG  
**Usage:** Hero section, profile images  
**Styling:** Rounded with border, shadow

### Favicon

**File:** `public/favicon.svg`  
**Size:** 100x100px (scalable)  
**Format:** SVG  
**Design:** Silver "S" on dark background with gradient

---

## Components

### Hero Section

```html
<!-- Gradient background with glow -->
<div class="photo-booth-hero">
  <!-- Radial gradient overlay -->
  <div class="absolute inset-0 bg-gradient-to-br from-silver-400/10 to-gold/5"></div>
  
  <!-- Content -->
  <h1 class="text-6xl md:text-8xl font-bold">
    <span class="bg-gradient-to-r from-silver-300 via-silver-400 to-silver-300 bg-clip-text text-transparent">
      Sitecore
    </span>
  </h1>
</div>
```

### Primary Buttons

```html
<!-- Silver button -->
<button class="bg-gradient-to-br from-silver-500 to-silver-600 text-slate-900 font-bold px-8 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
  Create Photo
</button>

<!-- Dark Silver button -->
<button class="bg-gradient-to-br from-silver-600 to-silver-700 text-white font-bold px-8 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
  View Gallery
</button>
```

### Card Backgrounds

```html
<!-- Silver glassmorphism card -->
<div class="bg-gradient-to-br from-silver-500 to-silver-600 bg-opacity-10 border border-silver-400 border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
  <!-- Content -->
</div>
```

### Text Styles

```html
<!-- Silver accent text -->
<h1 class="silver-accent">Text with silver glow</h1>

<!-- Description text -->
<p class="text-silver-300">Secondary description</p>
<p class="text-silver-400">Tertiary text</p>
<p class="text-silver-500">Disabled or faded text</p>
```

---

## Visual Design Patterns

### Backgrounds

**Hero Background:**
```css
background: linear-gradient(
  135deg,
  #1a1a1a 0%,
  #2d2d2d 25%,
  #1a1a1a 50%,
  #2a2a2a 75%,
  #1a1a1a 100%
);
```

**With Radial Glow:**
```css
background:
  radial-gradient(circle at 20% 50%, rgba(201, 180, 204, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
```

### Borders

- **Primary border:** `border-silver-400` with `border-opacity-30`
- **Subtle border:** `border-silver-600` with `border-opacity-20`
- **Accent border:** `border-silver-400` with no opacity

### Shadows

- **Small:** `shadow-md`
- **Medium:** `shadow-lg`
- **Large (hover):** `shadow-2xl`

### Animations

- **Fade in:** `animate-fade-in` (300ms)
- **Slide up:** `animate-slide-up` (400ms)
- **Pulse glow:** `animate-pulse-glow` (2s)

---

## Spacing System

Based on Tailwind's 4px grid:

| Token | Size | Usage |
|-------|------|-------|
| **xs** | 6px | Small gaps, tight spacing |
| **sm** | 12px | Component padding |
| **md** | 16px | Section padding |
| **lg** | 24px | Large section gaps |
| **xl** | 32px | Hero padding |

---

## Responsive Design

### Breakpoints

| Screen | Width | Usage |
|--------|-------|-------|
| **Mobile** | <640px | `<md:` classes |
| **Tablet** | 640px-1024px | `md:` to `lg:` |
| **Desktop** | >1024px | `lg:` classes |

### Typography Scaling

```html
<!-- Mobile: 2xl, Desktop: 4xl -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">Title</h1>

<!-- Mobile: 1 col, Desktop: 2 col -->
<div class="grid grid-cols-1 md:grid-cols-2">
  <!-- Grid items -->
</div>
```

---

## Accessibility

### Contrast Ratios

- **Silver 400 on dark (#1a1a1a):** 6.5:1 (AAA)
- **White on dark:** 15:1 (AAA)
- **Silver 500 on dark:** 4.5:1 (AA)

### Focus States

```css
focus:outline-none focus:ring-2 focus:ring-silver-400 focus:ring-offset-2 focus:ring-offset-slate-900
```

### Semantic HTML

- Use `<button>` for interactive elements
- Use `<a>` for navigation
- Use semantic heading levels (h1 > h2 > h3)

---

## Dark Mode Considerations

The entire app is designed for dark mode:

- **Background:** Dark gray (#1a1a1a)
- **Text:** White for primary, silver shades for secondary
- **Accents:** Silver and gold for highlights
- **Borders:** Silver with reduced opacity

---

## Usage Examples

### Home Page Hero

```tsx
<div className="photo-booth-hero flex-1 flex items-center justify-center">
  <div className="text-center space-y-6 animate-fade-in">
    {/* Logo with glow */}
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-silver-400 to-silver-600 rounded-full blur-2xl opacity-30 scale-110"></div>
      <Image src="/logo.jpg" alt="Logo" width={140} height={140} className="relative rounded-full border-4 border-silver-400" />
    </div>

    {/* Title with gradient */}
    <h1 className="text-6xl md:text-8xl font-bold">
      <span className="bg-gradient-to-r from-silver-300 via-silver-400 to-silver-300 bg-clip-text text-transparent">
        Sitecore
      </span>
    </h1>

    {/* CTA Buttons */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href="/input" className="bg-gradient-to-br from-silver-500 to-silver-600 hover:shadow-2xl transition-all transform hover:scale-105">
        Create Photo
      </Link>
    </div>
  </div>
</div>
```

### Card Component

```tsx
<div className="silver-bg p-6 rounded-lg">
  <h3 className="text-xl font-bold mb-2">Card Title</h3>
  <p className="text-silver-300">Card description</p>
</div>
```

---

## Deployment Notes

### Assets to Include

- ✅ `public/logo.jpg` - Official Sitecore Silver logo
- ✅ `public/favicon.svg` - App favicon
- ✅ Tailwind config with silver palette
- ✅ Global CSS with gradients and animations

### Browser Support

- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** Full support (may need -webkit prefixes)
- **Mobile:** Fully responsive

### Performance

- Use SVG for favicon (scales perfectly)
- Use JPEG for logo (already compressed)
- CSS gradients are GPU-accelerated
- No animation blocking

---

## Future Customization

When adapting for different events:

1. Update color variables in `tailwind.config.ts`
2. Replace `public/logo.jpg` with event logo
3. Update `public/favicon.svg` with new design
4. Adjust gradient directions in `globals.css`
5. Modify text in home page (H1, taglines)

---

**Design System Version:** 1.0  
**Last Updated:** June 1, 2026  
**Maintained By:** Design Team

For questions, refer to the [Sitecore Brand Guidelines](https://www.sitecore.com/).
