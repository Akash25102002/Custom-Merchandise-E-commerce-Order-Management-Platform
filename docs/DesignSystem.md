# Design System Specification
## Custom Merchandise E-Commerce & Order Management Platform

---

## 1. Design System Tokens & Foundations

### 1.1 Color Palette
- **Primary Accent**: Emerald `#10B981` (Glows, Primary CTAs, Active States)
- **Secondary Accent**: Cyan `#06B6D4` (Highlights, Badges, Links)
- **Tertiary Accent**: Violet `#8B5CF6` (Special tags, Customization steps)
- **Dark Backgrounds**:
  - Main Background: `#080C14` / Slate 950 `#020617`
  - Card Surface: `rgba(15, 23, 42, 0.6)` with `backdrop-filter: blur(12px)`
  - Border Color: `rgba(255, 255, 255, 0.08)` / Slate 800 `#1E293B`
- **Text Scale**:
  - Primary Foreground: `#F8FAFC` (Slate 50)
  - Muted Foreground: `#94A3B8` (Slate 400)
  - Highlight Text: `#34D399` (Emerald 400)

### 1.2 Typography
- **Primary Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Monospace Font**: `Fira Code`, `JetBrains Mono`, `Courier New`
- **Scale**:
  - `Display / H1`: `3.5rem` / `56px`, `leading: 1.1`, `font-weight: 800`
  - `H2`: `2.25rem` / `36px`, `leading: 1.2`, `font-weight: 700`
  - `H3`: `1.5rem` / `24px`, `leading: 1.3`, `font-weight: 600`
  - `Body`: `1rem` / `16px`, `leading: 1.5`, `font-weight: 400`
  - `Caption`: `0.75rem` / `12px`, `leading: 1.4`, `font-weight: 500`

### 1.3 Spacing & Layout Grid
- 8pt grid system: `4px (0.5)`, `8px (1)`, `12px (1.5)`, `16px (2)`, `24px (3)`, `32px (4)`, `48px (6)`, `64px (8)`.

---

## 2. Component Specifications

### 2.1 Buttons
- **Primary**: Gradient Emerald to Cyan (`from-emerald-500 via-teal-500 to-cyan-500`), text Slate 950, rounded-xl, shadow-lg, hover scale 1.02.
- **Secondary**: Slate 900 background, border Slate 800, text Slate 100, hover border Emerald 500/40.
- **Danger**: Rose 500/10 background, border Rose 500/30, text Rose 400.
- **Disabled State**: `opacity: 0.5`, `cursor: not-allowed`.

### 2.2 Form Controls & Inputs
- **Glass Input**: `background: rgba(15, 23, 42, 0.6)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `backdrop-filter: blur(8px)`.
- **Focus State**: `border-color: #10B981`, `box-shadow: 0 0 15px rgba(16, 185, 129, 0.2)`.
- **Validation Errors**: Rose 400 helper text underneath input field.

### 2.3 Cards & Containers
- **Glass Card**: `background: rgba(15, 23, 42, 0.5)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)`.
- **Hover Card**: `border-color: rgba(16, 185, 129, 0.3)`, `box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.15)`.

### 2.4 Tables
- **Header**: Slate 900 background, uppercase 11px font, Slate 400 color.
- **Row**: Border bottom Slate 800/80, hover Slate 900/50, transition 150ms.
- **Badges**: Status-colored pills with background opacity 15% and border opacity 30%.

### 2.5 Alerts & Toast Notifications
- **Success**: Emerald text and border with dark backdrop.
- **Error**: Rose text and border.
- **Info**: Cyan text and border.
- **Warning**: Amber text and border.

### 2.6 Loading States & Skeletons
- Pulse animation (`animate-pulse`) over Slate 800/60 rounded blocks.
- Spinner loader (`Loader2` from Lucide React) with spin animation (`animate-spin`).

### 2.7 Empty States
- Centered layout featuring muted icon, headline, helper description, and primary CTA button.

---

## 3. Responsive Breakpoints & Dark Mode

### Breakpoints:
- `sm`: `640px` (Mobile landscape / small tablet)
- `md`: `768px` (Tablet)
- `lg`: `1024px` (Laptop)
- `xl`: `1280px` (Desktop)
- `2xl`: `1536px` (Ultrawide)

### Dark Mode Enforcement:
- Dark mode first design system. Dark background `#080C14` default across all pages.

---

## 4. Animation Guidelines (Framer Motion)
- **Modal Transitions**: `initial={{ opacity: 0, scale: 0.95, y: 20 }}`, `animate={{ opacity: 1, scale: 1, y: 0 }}`, `exit={{ opacity: 0, scale: 0.95, y: 20 }}` with spring transition.
- **Page Transitions**: Fade in `duration: 0.4s`.
- **Micro-Interactions**: Hover scale `1.02`, tap scale `0.98`.

---

## 5. Accessibility Rules (WCAG 2.1 AA)
- High contrast text (`#F8FAFC` on `#080C14` exceeds 7:1 contrast ratio).
- Keyboard navigation support (`tabIndex={0}`, focus rings visible).
- ARIA labels on screen-reader interactive elements.
- Semantic HTML tags (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`).
