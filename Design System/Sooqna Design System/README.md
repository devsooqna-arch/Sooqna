# Sooqna Design System

## Overview

**Sooqna** (سوقنا — "Our Market") is an Arabic-language online classified ads marketplace targeting Jordan and the broader Arab world. It is analogous to OLX/Craigslist for the Jordanian market. Users can browse, post, search, and communicate about listings across categories like real estate, cars, electronics, furniture, jobs, and more.

### Products

| Product | Description |
|---|---|
| **Web App** (`apps/web`) | Next.js 14 frontend — the main consumer-facing product. RTL Arabic UI. |
| **Backend API** (`backend/sooqna-backend`) | Express + TypeScript + Prisma + PostgreSQL. REST API only, no UI. |
| **Mobile** (`apps/mobile`) | Placeholder — future app, not yet implemented. |

### Sources

- **Codebase**: `devsooqna-arch/Sooqna` on GitHub (monorepo)
  - Frontend: `apps/web/src/`
  - Global styles: `apps/web/src/app/globals.css`
  - Components: `apps/web/src/components/`
- **Branding assets**: `apps/web/public/branding/` (logo, favicon)
- **Hero images**: `apps/web/public/hero/` (slide-1.png, slide-2.png)
- No Figma file was provided.

---

## CONTENT FUNDAMENTALS

### Language
- **Primary language**: Arabic (العربية), right-to-left (RTL)
- The UI is entirely in Arabic. No English UI strings appear to the user.
- Dates are localized: `ar-JO` (Jordanian Arabic) locale

### Tone & Voice
- **Friendly and direct** — marketplace-style, action-oriented copy
- **Second-person "أنت" (you)** implied throughout: "أضف إعلانك", "ابحث", "اكتشف"
- Calls to action are imperative verbs: أعلن (Advertise!), تصفح (Browse!), ابحث (Search!), راسل (Message!)
- Copy is brief and punchy — no long paragraphs in UI
- Trust signals used: "بسهولة وأمان" (easily and safely), "مجاني" (free)

### Casing
- Arabic has no letter-case concept. Headlines use short declarative phrases.
- No ALL CAPS used anywhere.

### Emoji
- **Yes, emoji are used** — exclusively for category icons in the home/listings grid (🚗 🏠 📱 🛋️ 💼 👗 🧸 ⚽ 🔧 📦)
- A ★ emoji is used in the "مميز ★" (Featured) badge
- Not used in body copy or navigation

### Sample Copy
> اكتشف أفضل الإعلانات بسهولة وأمان  
> ابحث حسب المدينة أو التصنيف ووصل لنتيجتك بسرعة  
> أعلن — + أعلن (header CTA)  
> راسل البائع (message the seller)  
> جميع الحقوق محفوظة © 2005-2026

---

## VISUAL FOUNDATIONS

### Color System
Three themes: **Classic** (default), **Light**, **Dark** — toggled via `data-theme` attribute on `<html>`.

| Token | Classic | Light | Dark | Purpose |
|---|---|---|---|---|
| `--brand` | `#2d6a2d` | `#2d6a2d` | `#5cb85c` | Primary green — buttons, active states, links |
| `--brand-hover` | `#245824` | `#245824` | `#4aa04a` | Darker green on hover |
| `--brand-contrast` | `#ffffff` | `#ffffff` | `#0d1a0d` | Text on brand bg |
| `--accent-strip` | `#a8d520` | `#8bc34a` | `#1e3d1e` | Lime strip under nav header |
| `--accent-soft` | `#edf7cc` | `#e8f5e0` | `#1a3020` | Soft green tint for price boxes, hovers |
| `--bg` | `#f0f0f0` | `#f8faf4` | `#0d1a0d` | Page background |
| `--surface` | `#ffffff` | `#ffffff` | `#152415` | Cards, panels |
| `--surface-muted` | `#f7f8f5` | `#f2f6ec` | `#1a2e1a` | Secondary surfaces, skeletons |
| `--border` | `#dde3d8` | `#d4dfca` | `#243d24` | Card borders, dividers |
| `--text` | `#1a1f16` | `#1a2416` | `#dceedd` | Primary text |
| `--text-muted` | `#6b7563` | `#5c7052` | `#86ab87` | Secondary text, labels |
| `--chip` | `#f0f4e8` | `#edf5e4` | `#1e341e` | Category chips, tags |
| `--chip-border` | `#c5d4a0` | `#b8d49a` | `#2e502e` | Chip borders |
| `--danger` | `#dc2626` | `#dc2626` | `#f87171` | Errors, destructive actions |
| `--star` | `#f5a623` | `#f5a623` | `#f5c842` | Star ratings |
| `--featured` | `#f5a623` | `#f5a623` | `#d4880a` | Featured listing badge bg |

### Typography
- **Font stack**: `"Tahoma", "Segoe UI", system-ui, sans-serif`
- Tahoma is the traditional choice for Arabic web text — compact, legible, well-kerned for Arabic glyphs
- No custom web fonts loaded — relies on system fonts
- **Substitute on Google Fonts**: `Noto Sans Arabic` is the closest match

| Usage | Size | Weight | Class |
|---|---|---|---|
| Hero headline | 28–32px | 700 (bold) | — |
| Page title (`h1`) | 32–40px | 800 (extrabold) | `text-4xl font-extrabold` |
| Section title | 20–24px | 700 | `text-2xl font-bold` |
| Card title | 14px | 700 | `text-sm font-bold` |
| Body / description | 14px | 400 | `text-sm` |
| Labels / meta | 12px | 400–500 | `text-xs` |
| Bottom nav labels | 10px | 500 | `text-[10px] font-medium` |

### Spacing & Layout
- Max content width: **1110px** (`max-w-[1110px]`)
- Container padding: `px-4 sm:px-6`
- Section gaps: `space-y-7` (28px) between major sections
- Card internal padding: `p-3` to `p-5`
- Grid: 1 col → 2 col → 3 col at sm/xl breakpoints

### Backgrounds
- Page background is a **neutral off-white/gray** — not pure white; creates depth contrast with white card surfaces
- No background images, patterns, or gradients on page bg
- Hero uses full-bleed photography with a **black overlay at 45% opacity**

### Cards
- Border: `1px solid var(--border)`
- Border radius: `rounded-lg` (8px) for standard cards; `rounded-xl` (12px) for detail panels
- Background: `var(--surface)` (white)
- Shadow: `var(--shadow)` (very subtle — `0 1px 3px rgba(0,0,0,.08)`)
- Hover shadow: `var(--shadow-md)` (slightly deeper)
- No left-border accent color strips

### Buttons
- **Primary**: `rounded-full bg-[var(--brand)] text-[var(--brand-contrast)]` — solid green pill
- **Secondary / ghost**: `rounded-full border border-[var(--chip-border)] bg-[var(--chip)]` — chip-style pill
- **Danger / outline**: border-based with colored text
- Hover: `hover:opacity-90` on primary; `hover:text-[var(--text)]` on ghost
- No box shadows on buttons. No gradients.
- Sizes: `px-5 py-2 text-sm` (standard), `px-6 py-2 text-xs` (small), `px-4 py-3 text-sm` (wide CTA)

### Borders & Radius
- Standard radius: `rounded-lg` (8px) — cards, inputs, chips
- Large radius: `rounded-xl` (12px) — detail panels
- Pill radius: `rounded-full` — all buttons, badges, nav chips
- Border color: `var(--border)` (muted green-gray)

### Shadows
- `--shadow`: `0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)` — default card shadow
- `--shadow-md`: `0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06)` — hover state

### Animations & Transitions
- Hero slider: fade + translate (`transition-all duration-700 ease-in-out`) — slide cross-fade
- Image hover: `transition duration-300 group-hover:scale-105` — subtle zoom on listing images
- Hover states on links/buttons: color transitions, opacity changes — no spring/bounce
- Skeleton loaders use `animate-pulse`
- General: `transition` (150ms ease) for interactive elements

### Images
- Hero images: full-bleed photography of Jordanian urban scenes
- Listing images: user-uploaded, cover-fill (`object-cover`)
- Black gradient overlay on listing card images (bottom): `bg-gradient-to-t from-black/60 via-black/20 to-transparent`
- Image placeholder: inline SVG (landscape icon) at 40% opacity
- No grain, no color treatment applied to imagery

### Navigation
- **Desktop**: sticky top nav with logo + theme switcher + auth actions; secondary accent-strip bar with "+ أعلن" + search
- **Mobile**: fixed bottom tab bar (5 items: Search, Favorites, Post, Messages, Account); floating "+" button elevated above bar

### Transparency & Blur
- Hero overlay: `bg-black/45`
- Gradient overlays on card images
- Bottom nav mobile: solid (no blur)
- No glassmorphism/blur effects

### Iconography
- See ICONOGRAPHY section below.

---

## ICONOGRAPHY

- **Icon style**: Inline SVG, stroke-based, `strokeWidth="2"`, `strokeLinecap="round"`, `strokeLinejoin="round"` — consistent with Heroicons / Feather style
- **Icon size**: 22×22px in nav, 11–16px inline, 40×40px for empty states
- **Color**: `currentColor` — inherits text color
- **No icon font / sprite system** used
- **Category icons**: emoji only (🚗 🏠 📱 🛋️ 💼 👗 🧸 ⚽ 🔧 📦)
- **No SVG illustration assets** found in codebase
- **Substitution**: Heroicons (outline) from CDN is the closest system match

### Common Icons Used
| Icon | Usage |
|---|---|
| Circle + line (search) | Search bar, bottom nav |
| Heart (path) | Favorites |
| Plus lines | Post listing |
| Chat bubble | Messages |
| User circle | Account |
| Location pin | Listing location |
| Star | Rating |
| Triangle warning | Report |

### Assets in This Design System
- `assets/logo.png` — main logo (82×40px display size)
- `assets/favicon.png` — small favicon / app icon
- `assets/hero-slide-1.png` — hero banner image 1
- `assets/hero-slide-2.png` — hero banner image 2

---

## File Index

```
README.md                          ← This file (full design system documentation)
SKILL.md                           ← Agent skill configuration
colors_and_type.css                ← CSS custom properties (all tokens, all themes)

assets/
  logo.png                         ← Main Sooqna logo
  favicon.png                      ← Favicon / app icon
  hero-slide-1.png                 ← Hero banner image 1
  hero-slide-2.png                 ← Hero banner image 2

preview/
  colors-brand.html                ← Brand + accent color swatches
  colors-semantic.html             ← Semantic/state color tokens
  colors-themes.html               ← Theme comparison (classic/light/dark)
  type-scale.html                  ← Typography scale specimen
  type-arabic.html                 ← Arabic type rendering specimen
  spacing-tokens.html              ← Spacing, radius, shadow tokens
  components-buttons.html          ← Button variants
  components-cards.html            ← Listing card + detail card
  components-chips.html            ← Chips, badges, filters
  components-nav.html              ← Header navigation
  components-bottomnav.html        ← Mobile bottom nav
  components-forms.html            ← Inputs, selects
  brand-logo.html                  ← Logo usage
  brand-hero.html                  ← Hero banner

ui_kits/web/
  README.md                        ← Web UI kit documentation
  index.html                       ← Main interactive prototype
  Shell.jsx                        ← Header + footer + bottom nav
  ListingCard.jsx                  ← Listing card component
  ListingDetail.jsx                ← Listing detail page
  ListingsPage.jsx                 ← Listings browse page
  HomePage.jsx                     ← Home marketplace page
```
