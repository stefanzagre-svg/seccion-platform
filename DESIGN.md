# Session - Design System (Electric Sophistication)

## 1. Core Principles
- **Hi-Tech & Premium**: Sleek interfaces, subtle glowing elements, high contrast.
- **Dynamic Interaction**: Every action feels responsive and "alive" (micro-animations, smooth transitions).
- **Dark Mode First**: Deep dark backgrounds with neon accents.

## 2. Color Palette (Semantic Tokens)
- **Deep Dark**: `#050505` (Main Background Base)
- **Background Surface**: `#0F0F1A` (Card Interiors)
- **Neon Pink**: `#FF00D4` / `#FF00FF` (Used for glows, accents, and layering)
- **Electric Cyan**: `#00FFFF` (Primary interactive color, borders, neon texts)
- **Text Primary**: `#FFFFFF` (White)
- **Text Secondary**: `#C5C6C7` (Light Gray)
- **Error/Danger**: `#FF204E` (Neon Red)
- **Success/Safe**: `#39FF14` (Neon Green)

## 3. Typography
- **Font Family**: `Outfit` (Primary) for headings and numbers to provide a chunky, ultra-modern aesthetic. `Inter` for body text.
- **Hierarchy** (from Stitch Specs):
  - Heading 1: 64px, Bold
  - Heading 2: 48px, Bold
  - Heading 3: 32px, Medium
  - Body Text: 16px, Regular

## 4. Components & Shapes
- **Border Radius**: 
  - Outer containers/Cards: `16px` to `24px`
  - Buttons/Inputs: `100px` (Fully rounded pills)

## 5. CSS Specifications (Stitch Blueprint)
The exact developer values used for the "Neon Noir" aesthetic across the platform:

### Glassmorphism Effect (.glass-card)
```css
background-color: rgba(255, 255, 255, 0.1); /* 10% Opacity */
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.2); /* 20% Opacity */
```

### Neon Glow Specifications (.neon-text & .neon-button)
**Neon Text:**
```css
color: #ffffff;
text-shadow: 
  0 0 5px #ff00d4, 
  0 0 10px #ff00d4, 
  0 0 20px #ff00d4, 
  0 0 40px #00ffff, 
  0 0 80px #00ffff;
```

**Neon Button:**
```css
background-color: transparent;
color: #ffffff;
border: 2px solid #00ffff;
box-shadow: 
  0 0 10px #ff00d4, 
  0 0 20px #ff00d4, 
  0 0 30px #00ffff, 
  0 0 60px #00ffff;
```

## 5. Micro-Animations (Framer Motion)
- **Hover States**: Slight scale up `scale(1.02)` and increased brightness.
- **Page Transitions**: Smooth opacity fade in/out (`0.3s ease-in-out`).
- **Gauge/Progress Bars**: Animated width transitions with glowing head.

## 6. Layout
- **Container**: Max width `1200px` for desktop, fluid width with `16px` padding for mobile.
- **Grid**: 12-column grid system with `24px` gaps.
- **Rhythm**: Consistent vertical spacing using multiples of `8px`.
