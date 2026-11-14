# DESIGN.md — Recipe App UI/UX Specification

**Project:** Recipe App v1 (React + TypeScript + Tailwind CSS + shadcn/ui)  
**Reference PRD:** PRD.md (`{{DATA:DOCUMENT:DOCUMENT_1}}`)  
**Design Philosophy:** Minimalist, clean, utility-first, distraction-free cooking companion with high typographic craft and strict adherence to shadcn/ui conventions.

---

## 1. Visual Direction & Aesthetic

- **Style:** Clean, airy, modern utility minimalist. High contrast for readability in kitchen environments.
- **Tone:** Focused, calm, purposeful, warm neutral.
- **Palette (shadcn/ui Neutral + Warm Culinary Accent):**
  - `background`: `#FAF9F6` (Warm alabaster / off-white) or `#FFFFFF`
  - `foreground`: `#18181B` (Zinc-900 / soft black)
  - `card`: `#FFFFFF`
  - `card-foreground`: `#18181B`
  - `muted`: `#F4F4F5` (Zinc-100)
  - `muted-foreground`: `#71717A` (Zinc-500)
  - `border`: `#E4E4E7` (Zinc-200)
  - `primary`: `#18181B` (Deep zinc / charcoal for primary actions)
  - `primary-foreground`: `#FAFAFA`
  - `accent`: `#F43F5E` (Warm rose/paprika) or `#F97316` (Warm amber) — used sparingly for badges like calorie tags and highlights.
  - `destructive`: `#EF4444` (Zinc/red for errors)
- **Typography:**
  - Font family: Inter or Geist (`sans-serif`), clear geometric sans for UI and numeric ingredient measurements.
  - Display/Headings: Clean semi-bold/medium tracking slightly tight (`tracking-tight`).
  - Recipe steps: High line-height (`leading-relaxed`) for comfortable reading while cooking.

---

## 2. Core Layout & Architecture

The app is a single-view, distraction-free container with an interactive details modal.

### Top-to-Bottom Structure
1. **Header / Masthead:**
   - Brand title: `Recipe App` (or clean monogram mark + title) with subtle subtitle ("Simple, live recipes for everyday cooking").
   - Responsive container: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
2. **Search Bar Section (Prominent, Centered):**
   - Controlled search input with Lucide search icon + Clear button (X) when text is present.
   - Immediate "Search" button (`shadcn Button variant="default"`).
   - Validation hint underneath (`Type at least 3 characters.` when query length is 1 or 2).
   - Search status indicator / live feedback.
3. **Content Stage (Mutually Exclusive State Display):**
   - **State A: Homepage Popular Picks (Default):**
     - Section title: "Popular picks" (with subtle count/hint).
     - Responsive Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
     - 4 initial recipe cards loaded from curated dish list.
     - "Show more" button centered below the grid (`shadcn Button variant="outline"`). Disabled and shows spinner when loading. Hidden if list exhausted.
   - **State B: Live Search Active / Results:**
     - Status header (e.g. `Showing recipes for "lentil soup"` with a "Clear search" link).
     - Search results grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
   - **State C: Search Loading:**
     - Skeleton cards or animated subtle text: "Searching recipes…" + disabled button state.
   - **State D: Search Empty:**
     - Minimalist illustration/icon + "No recipes found for “{query}”. Try a different word."
   - **State E: Search Error:**
     - Subtle alert box: "Something went wrong. Please try again." with retry action.
4. **Recipe Details Modal (shadcn/ui Dialog):**
   - Accessible overlay modal (`DialogContent` max-w-2xl).
   - Header with recipe title, servings badge, calorie badge (if available), and close icon.
   - Two distinct tabs or vertical sections:
     - **Ingredients List:** Checkable or bulleted items with quantities and clean ingredient names (e.g. bold quantity + unit, formatted name).
     - **Step-by-step Instructions:** Clean numbered badges with generous spacing and relaxed line height.
   - Closes on Esc key or Close button, returning focus cleanly.

---

## 3. shadcn/ui Component Guidelines

| shadcn Component | Usage in Recipe App | Customization Rules |
|---|---|---|
| `Input` | Search query field | `h-12 text-base px-4 rounded-xl border-zinc-200 focus-visible:ring-zinc-900` |
| `Button` | Search CTA, Show more, Details trigger, Close modal | `rounded-xl font-medium transition-all` |
| `Card` | Recipe Card preview | Clean border, subtle hover elevation (`hover:border-zinc-300 hover:shadow-sm transition-all`), `rounded-2xl` |
| `Dialog` | Recipe Details modal | `sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6` |
| `Badge` | Servings, Ingredient count, Calorie badge | `variant="secondary"` with neutral tones; accent pill for calories `~N kcal / serving` |
| `Skeleton` | Loading state cards | Pulse shimmer effect matching card shape and typography |

---

## 4. Recipe Card UI Specification

Because API Ninjas does not provide food photography, the card leverages an elegant typographic & geometric placeholder system:
- **Card Aspect & Container:**
  - Header graphic: Soft warm-tinted geometric block with an elegant Lucide culinary icon (e.g., `UtensilsCrossed`, `Soup`, `ChefHat`, `Flame`, `Sparkles`) varied by recipe index/hash.
- **Card Content:**
  - **Category / Meta Tag row:** Servings badge (`e.g., "4 servings"`) + Ingredient count (`"11 ingredients"`).
  - **Title:** `text-lg font-semibold tracking-tight text-zinc-900 line-clamp-2 min-h-[3.5rem]`.
  - **Optional Calorie Pill:** `~420 kcal / serving` (if `nutrition.calories` is valid and present).
  - **Footer:** Full-width or right-aligned "View Details" / "Details" outline button that triggers the modal.

---

## 5. Micro-interactions & Motion Rules

- **Debounce Feedback:** When typing beyond 3 characters, show subtle indicator or disable button briefly until debounce timeout triggers.
- **Modal Transitions:** Fast 150ms ease-out enter animation (`fade-in-0 zoom-in-95`), clean backdrop blur (`backdrop-blur-sm bg-black/40`).
- **Card Hover:** Subtle translate `-translate-y-0.5` and border transition `border-zinc-300`.
- **Keyboard Navigation:** Full Tab indexing and Esc key dismiss support on modal.

---

## 6. Implementation Checklist for Agents

- [ ] Use Tailwind CSS classes matching the zinc neutral palette.
- [ ] Keep state minimal in `App.tsx` and refactor cleanly into components as per PRD Section 15 (`RecipeCard`, `RecipeDetails`, `useDebounce`).
- [ ] All API responses typed with strict `Recipe` TypeScript interface without `any`.
- [ ] Support empty query restoration: clearing input restores the 4+ homepage picks instantly without re-fetching.
- [ ] No image hallucination; use styled SVG/Lucide icons for cards.
