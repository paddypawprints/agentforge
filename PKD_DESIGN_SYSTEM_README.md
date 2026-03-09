# Neo Philip K Dick Paranoid Future Design System

## 🎨 Overview

A complete, production-ready design system inspired by Philip K. Dick's paranoid vision of reality. This system combines retro-futuristic aesthetics with modern web design principles, creating an interface that feels like it's monitoring you as much as you're monitoring it.

**Theme**: Surveillance state, reality distortion, paranoid computing, glitchy technology, neon dystopia

---

## 📦 What's Included

### 1. **CSS Design System** (`src/styles/neo-pkd-design-system.css`)
- Complete color palette with CSS variables
- Grid system (8px base unit)
- Typography system with monospace and sans-serif fonts
- Component styles (buttons, cards, inputs, badges, alerts)
- Animation library (glitch, paranoid pulse, scan lines, reality distortion)
- Utility classes for common patterns
- Responsive design with mobile-first approach
- Accessibility features (reduced motion, high contrast, focus states)
- Light mode support

### 2. **Design System Documentation** (`src/styles/NEO_PKD_DESIGN_SYSTEM.md`)
- Complete component reference
- Color palette guide
- Typography guidelines
- Animation documentation
- Layout patterns
- CSS variables reference
- Usage examples
- Design philosophy

### 3. **PKD-Styled App** (`src/App-pkd.tsx`)
- Example implementation using the design system
- Grid-based layout
- All component types demonstrated
- Ready to use as a template

### 4. **Component Showcase** (`src/components/PKDShowcase.tsx`)
- Interactive demo of all design system elements
- Color palette display
- Button variations
- Text styles
- Badges and alerts
- Animation demonstrations
- Form inputs
- Grid layout examples

### 5. **Tailwind Integration** (`tailwind.config.js`)
- PKD colors added to Tailwind config
- Seamless integration with existing Tailwind setup

---

## 🚀 Quick Start

### 1. Import the Design System
The design system CSS is automatically imported in `src/index.tsx`:

```typescript
import './styles/neo-pkd-design-system.css';
```

### 2. Use in Your Components
```tsx
import React from 'react';

export function MyComponent() {
  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      <header className="pkd-border-bottom">
        <h1 className="pkd-heading pkd-heading-1 pkd-text-primary">
          PARANOID FUTURE
        </h1>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="pkd-card pkd-paranoid-pulse">
          <h2 className="pkd-heading pkd-heading-3 pkd-text-primary">
            SURVEILLANCE ACTIVE
          </h2>
          <p className="pkd-text-mono">Content here...</p>
        </div>

        <button className="pkd-button">CLICK ME</button>
      </main>
    </div>
  );
}
```

### 3. View the Showcase
To see all design system elements in action, use the `PKDShowcase` component:

```tsx
import { PKDShowcase } from './components/PKDShowcase';

export default function App() {
  return <PKDShowcase />;
}
```

---

## 🎨 Color Palette

| Color | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| **Primary** | `#00ff41` | Main actions, highlights, surveillance | `--pkd-primary` |
| **Secondary** | `#7c3aed` | Secondary actions, reality distortion | `--pkd-secondary` |
| **Accent** | `#ff6b35` | Warnings, alerts, danger indicators | `--pkd-accent` |
| **Destructive** | `#ef4444` | Critical errors, threats | `--pkd-destructive` |
| **Background** | `#0a0a0a` | Main background, void | `--pkd-background` |
| **Foreground** | `#f5f5f5` | Text, primary content | `--pkd-foreground` |

---

## 🏗️ Grid System

The design system uses an **8px base grid unit**:

```css
--pkd-grid-size: 8px
```

All spacing, padding, and sizing should be multiples of 8px:
- `8px` (1 unit)
- `16px` (2 units)
- `24px` (3 units)
- `32px` (4 units)
- etc.

### Grid Background
The entire page displays a visible grid pattern:

```html
<div class="pkd-scan-lines min-h-screen" style="background-color: var(--pkd-background)">
  <!-- Content appears over grid background -->
</div>
```

---

## 🔤 Typography

### Font Families
- **Monospace**: `'Courier New', 'Courier', monospace` (technical content)
- **Sans-serif**: `'Helvetica Neue', 'Arial', sans-serif` (body text)

### Heading Sizes
- `.pkd-heading-1`: 2.5rem (page titles)
- `.pkd-heading-2`: 2rem (section headings)
- `.pkd-heading-3`: 1.5rem (subsection headings)

### Text Utilities
- `.pkd-text-primary`: Green text with glow
- `.pkd-text-secondary`: Purple text with glow
- `.pkd-text-accent`: Orange text with glow
- `.pkd-text-mono`: Monospace font
- `.pkd-text-uppercase`: Uppercase with wide letter spacing

---

## 🎯 Components

### Buttons
```tsx
<button className="pkd-button">PRIMARY</button>
<button className="pkd-button pkd-button-secondary">SECONDARY</button>
<button className="pkd-button pkd-button-danger">DANGER</button>
```

### Cards
```tsx
<div className="pkd-card">
  <h3 className="pkd-heading pkd-heading-3">Card Title</h3>
  <p>Card content</p>
</div>
```

### Inputs
```tsx
<input type="text" className="pkd-input" placeholder="Enter text..." />
<select className="pkd-input">
  <option>Option 1</option>
</select>
<textarea className="pkd-input"></textarea>
```

### Badges
```tsx
<span className="pkd-badge">STATUS: ACTIVE</span>
<span className="pkd-badge pkd-badge-secondary">SECONDARY</span>
<span className="pkd-badge pkd-badge-danger">CRITICAL</span>
```

### Alerts
```tsx
<div className="pkd-alert">Standard alert</div>
<div className="pkd-alert pkd-alert-warning">Warning alert</div>
<div className="pkd-alert pkd-alert-danger">Danger alert</div>
```

---

## ✨ Animations

### Paranoid Pulse
Pulsing glow effect suggesting surveillance:
```tsx
<div className="pkd-paranoid-pulse">Pulsing Element</div>
```

### Scan Lines
CRT monitor scan line effect:
```tsx
<div className="pkd-scan-lines">Content with scan lines</div>
```

### Reality Distortion
Subtle skew animation:
```tsx
<div className="pkd-reality-distort">Distorted Content</div>
```

### Surveillance Blink
Blinking effect:
```tsx
<div className="pkd-surveillance-blink">Blinking Element</div>
```

### Glitch
Reality-distorting glitch effect:
```tsx
<div className="pkd-glitch">Glitchy Text</div>
```

### Spinner
Loading spinner:
```tsx
<div className="pkd-spinner"></div>
```

---

## 📐 Layout Patterns

### Two-Column Grid
```tsx
<div className="grid gap-8 lg:grid-cols-2">
  <div className="pkd-card">Column 1</div>
  <div className="pkd-card">Column 2</div>
</div>
```

### Full-Width Container
```tsx
<div className="mx-auto max-w-7xl px-4 py-8">
  <div className="pkd-card">Full-width content</div>
</div>
```

### Grid-Based Layout
```tsx
<div className="pkd-grid-container">
  <div className="pkd-grid-item">Item 1</div>
  <div className="pkd-grid-item">Item 2</div>
  <div className="pkd-grid-item">Item 3</div>
</div>
```

---

## ♿ Accessibility

The design system includes:
- **High contrast ratios** (WCAG AA compliant)
- **Clear focus states** with glow effects
- **Reduced motion support** for users with motion sensitivity
- **Semantic HTML** structure
- **Keyboard navigation** support
- **Screen reader** friendly

### Reduced Motion
Users with `prefers-reduced-motion` enabled will see minimal animations:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🌓 Light Mode

The design system includes automatic light mode support:

```css
@media (prefers-color-scheme: light) {
  :root {
    --pkd-background: #f5f5f5;
    --pkd-background-secondary: #e8e8e8;
    --pkd-foreground: #0a0a0a;
    /* ... other light mode colors ... */
  }
}
```

---

## 📱 Responsive Design

The design system is mobile-first and responsive:

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Headings
Heading sizes automatically scale down on mobile:

```css
@media (max-width: 768px) {
  .pkd-heading-1 { font-size: 1.875rem; }
  .pkd-heading-2 { font-size: 1.5rem; }
  .pkd-heading-3 { font-size: 1.25rem; }
}
```

---

## 🎓 Design Philosophy

### Paranoia as Aesthetic
Visual elements suggest surveillance and monitoring:
- Grid background (surveillance grid)
- Glowing elements (monitoring lights)
- Scan lines (CRT monitoring)
- Pulsing effects (system heartbeat)

### Reality Distortion
Elements subtly shift and distort:
- Glitch animations
- Skew transformations
- Color shifts
- Opacity changes

### Retro-Futuristic
Combines 1980s computer aesthetics with modern web:
- Monospace fonts (terminal aesthetic)
- Neon colors (arcade aesthetic)
- Grid-based layout (computer grid)
- Sharp edges (no rounded corners)

### Accessibility First
Despite the dystopian aesthetic:
- High contrast ratios
- Clear focus states
- Reduced motion support
- Semantic HTML

---

## 📚 File Structure

```
src/
├── styles/
│   ├── neo-pkd-design-system.css      # Main design system CSS
│   └── NEO_PKD_DESIGN_SYSTEM.md       # Design system documentation
├── components/
│   └── PKDShowcase.tsx                # Component showcase/demo
├── App-pkd.tsx                        # Example PKD-styled app
└── index.tsx                          # Imports design system CSS
```

---

## 🔧 CSS Variables Reference

### Colors
```css
--pkd-primary: #00ff41
--pkd-primary-dark: #00cc33
--pkd-primary-light: #33ff66
--pkd-primary-glow: rgba(0, 255, 65, 0.3)

--pkd-secondary: #7c3aed
--pkd-secondary-dark: #6d28d9
--pkd-secondary-light: #a78bfa
--pkd-secondary-glow: rgba(124, 58, 237, 0.3)

--pkd-accent: #ff6b35
--pkd-accent-dark: #e55a2b
--pkd-accent-light: #ff8c5a
--pkd-accent-glow: rgba(255, 107, 53, 0.3)

--pkd-destructive: #ef4444
--pkd-destructive-dark: #dc2626
--pkd-destructive-light: #f87171

--pkd-background: #0a0a0a
--pkd-background-secondary: #1a1a1a
--pkd-background-tertiary: #2a2a2a

--pkd-foreground: #f5f5f5
--pkd-foreground-muted: #a0a0a0
```

### Grid & Structure
```css
--pkd-grid-size: 8px
--pkd-grid-color: rgba(0, 255, 65, 0.05)
--pkd-grid-color-active: rgba(0, 255, 65, 0.15)

--pkd-border-color: rgba(0, 255, 65, 0.2)
--pkd-border-color-active: rgba(0, 255, 65, 0.5)
--pkd-border-width: 2px
```

### Effects
```css
--pkd-glow-soft: 0 0 10px rgba(0, 255, 65, 0.2)
--pkd-glow-medium: 0 0 20px rgba(0, 255, 65, 0.4)
--pkd-glow-intense: 0 0 30px rgba(0, 255, 65, 0.6)
--pkd-shadow-paranoid: 0 0 20px rgba(0, 0, 0, 0.8)
```

### Typography
```css
--pkd-font-mono: 'Courier New', 'Courier', monospace
--pkd-font-sans: 'Helvetica Neue', 'Arial', sans-serif
--pkd-letter-spacing-tight: -0.02em
--pkd-letter-spacing-normal: 0.02em
--pkd-letter-spacing-wide: 0.05em
```

### Transitions
```css
--pkd-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--pkd-transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1)
--pkd-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📖 Usage Examples

### Complete Page Layout
```tsx
import React from 'react';

export function MyPage() {
  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      {/* Header */}
      <header className="pkd-border-bottom">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="pkd-heading pkd-heading-1 pkd-text-primary">
            PAGE TITLE
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Instructions Card */}
        <div className="pkd-card mb-8 pkd-paranoid-pulse">
          <h2 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">
            INSTRUCTIONS
          </h2>
          <p className="pkd-text-mono">Content here...</p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="pkd-card">
            <h3 className="pkd-heading pkd-heading-3 pkd-text-primary">
              SECTION 1
            </h3>
            <p>Content...</p>
          </div>
          <div className="pkd-card">
            <h3 className="pkd-heading pkd-heading-3 pkd-text-secondary">
              SECTION 2
            </h3>
            <p>Content...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 🎬 Next Steps

1. **Explore the Showcase**: View `PKDShowcase` component to see all elements
2. **Read the Documentation**: Check `NEO_PKD_DESIGN_SYSTEM.md` for detailed reference
3. **Use in Your App**: Import the CSS and start using the classes
4. **Customize**: Modify CSS variables in `neo-pkd-design-system.css` to adjust colors/spacing
5. **Extend**: Add new components following the established patterns

---

## 📝 License

MIT License - Feel free to use and modify for your projects

---

## 🙏 Credits

Inspired by:
- Philip K. Dick's paranoid vision of reality
- 1980s computer aesthetics
- Cyberpunk design movements
- Surveillance state themes
- Retro-futuristic UI design

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
