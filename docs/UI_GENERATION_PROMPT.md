# UI Generation Prompt for Bible App

> Use this prompt with Figma Make, Builder.io, or similar AI design tools to generate the app UI.

---

## Prompt

```
Design a minimal, modern Bible reading app for mobile (iOS/Android) and web.

### App Purpose
A simple Bible reader focused on clean reading experience and easy navigation. Non-profit, open source project.

### Design System
- Use shadcn/ui component patterns
- Tailwind CSS styling (utility-first)
- Support light and dark themes
- Mobile-first, responsive design
- Clean typography optimized for reading

### Color Palette
Light mode:
- Background: white/neutral-50
- Text: neutral-900
- Accent: subtle blue or neutral tones
- Borders: neutral-200

Dark mode:
- Background: neutral-950
- Text: neutral-100
- Accent: subtle blue or neutral tones
- Borders: neutral-800

### Typography
- Serif font for Bible text (comfortable reading)
- Sans-serif for UI elements (clean, modern)
- Generous line height for readability
- Appropriate font sizes for mobile reading

### Screens to Design

#### 1. Home / Book Selection
- Grid or list of Bible books (66 books)
- Old Testament / New Testament sections
- Search or filter capability
- Clean header with app name
- Settings access

#### 2. Chapter Selection
- Show selected book name
- Grid of chapter numbers
- Back navigation to books
- Clean, tappable chapter buttons (44x44px minimum touch targets)

#### 3. Verse Reading View
- Book and chapter header
- Verse numbers (subtle, non-intrusive)
- Bible text with excellent readability
- Navigation: previous/next chapter
- Bottom navigation or swipe gestures
- Font size adjustment option

#### 4. Settings Screen
- Theme toggle (light/dark/system)
- Font size slider
- Font family selection (if applicable)
- About section
- Clean, organized layout

### Navigation Pattern
- Bottom navigation bar OR
- Tab-based navigation OR
- Drawer/sidebar navigation
(Choose what feels most natural for Bible reading)

### Key UX Principles
- Minimal distractions - focus on the text
- Fast navigation - get to any verse quickly
- Comfortable reading - easy on the eyes
- Touch-friendly - works well on mobile
- Accessibility - proper contrast, scalable text

### Component Style
- Rounded corners (radius-md or radius-lg)
- Subtle shadows for depth
- Smooth transitions
- Consistent spacing (use 4px grid)
- No unnecessary decoration

### Interactions
- Smooth page/chapter transitions
- Pull to refresh (if applicable)
- Swipe between chapters
- Tap verse number to select verse (future feature prep)

### Don't Include (MVP)
- User accounts / login
- Highlighting or annotation tools
- Bookmarks
- Search functionality (future feature)
- Social sharing
- Notes or comments

### Deliverables
1. Mobile screens (375px width)
2. Tablet adaptation (768px width)
3. Desktop adaptation (1280px width)
4. Light and dark theme variants
5. Component library with all UI elements
```

---

## Alternative Short Prompt

For quick generation, use this condensed version:

```
Design a minimal Bible reading app with:
- Book selection grid (66 books, OT/NT sections)
- Chapter selection (numbered grid)
- Verse reading view (clean typography, verse numbers)
- Settings (theme toggle, font size)

Style: shadcn/ui + Tailwind CSS, mobile-first, light/dark themes, serif font for Bible text, focus on readability. Touch-friendly (44px targets). No accounts, highlights, or search - just simple navigation and reading.
```

---

## Notes for Designer/AI

- Reference [shadcn/ui](https://ui.shadcn.com/) for component patterns
- Reference [Tailwind CSS](https://tailwindcss.com/) for spacing/colors
- Bible has 66 books: 39 Old Testament, 27 New Testament
- Chapters vary per book (Genesis has 50, Psalms has 150, etc.)
- Prioritize the reading experience above all else
