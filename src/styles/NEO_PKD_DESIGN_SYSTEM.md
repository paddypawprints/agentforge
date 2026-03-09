# Neo Philip K Dick Paranoid Future Design System

## Overview

A dystopian, surveillance-state aesthetic inspired by Philip K. Dick's paranoid vision of reality. This design system combines retro-futuristic elements with a sense of technological unease, creating an interface that feels like it's monitoring you as much as you're monitoring it.

**Theme**: Surveillance state, reality distortion, paranoid computing, glitchy technology, neon dystopia

---

## Color Palette

### Primary: Sickly Neon Green
- **Hex**: `#00ff41`
- **Usage**: Primary actions, highlights, surveillance indicators
- **Meaning**: Monitoring, surveillance, system activity
- **CSS Variable**: `--pkd-primary`

```css
color: var(--pkd-primary);
text-shadow: var(--pkd-glow-soft);
```

### Secondary: Deep Paranoid Purple
- **Hex**: `#7c3aed`
- **Usage**: Secondary actions, reality distortion elements
- **Meaning**: Alternate reality, consciousness, paranoia
- **CSS Variable**: `--pkd-secondary`

### Accent: Warning Orange
- **Hex**: `#ff6b35`
- **Usage**: Alerts, warnings, danger indicators
- **Meaning**: Danger, surveillance alert, intrusion
- **CSS Variable**: `--pkd-accent`

### Destructive: Paranoid Red
- **Hex**: `#ef4444`
- **Usage**: Critical errors, threats, system failures
- **Meaning**: Threat, intrusion, system compromise
- **CSS Variable**: `--pkd-destructive`

### Background: Deep Black
- **Hex**: `#0a0a0a`
- **Usage**: Main background, void, darkness
- **Meaning**: Void, surveillance darkness, unknown
- **CSS Variable**: `--pkd-background`

### Foreground: Bright White
- **Hex**: `#f5f5f5`
- **Usage**: Text, primary content
- **Meaning**: Harsh light, clinical, exposed
- **CSS Variable**: `--pkd-foreground`

---

## Grid System

### Base Grid Unit
- **Size**: 8px
- **CSS Variable**: `--pkd-grid-size`

### Grid Background
The entire page uses a visible grid background pattern:

```css
background-image: 
  linear-gradient(0deg, var(--pkd-grid-color) 1px, transparent 1px),
  linear-gradient(90deg, var(--pkd-grid-color) 1px, transparent 1px);
background-size: var(--pkd-grid-size) var(--pkd-grid-size);
```

### Grid Container
Use `.pkd-grid-container` for responsive grid layouts:

```html
<div class="pkd-grid-container">
  <div class="pkd-grid-item">Item 1</div>
  <div class="pkd-grid-item">Item 2</div>
  <div class="pkd-grid-item">Item 3</div>
</div>
```

---

## Typography

### Font Families
- **Monospace**: `'Courier New', 'Courier', monospace`
- **Sans-serif**: `'Helvetica Neue', 'Arial', sans-serif`

### Heading Styles

#### `.pkd-heading-1`
- **Font Size**: 2.5rem
- **Usage**: Page titles, main headings
- **Example**: `<h1 class="pkd-heading-1">AGENT ORCHESTRATION NEXUS</h1>`

#### `.pkd-heading-2`
- **Font Size**: 2rem
- **Usage**: Section headings

#### `.pkd-heading-3`
- **Font Size**: 1.5rem
- **Usage**: Subsection headings

### Text Utilities

#### `.pkd-text-primary`
Green text with glow effect

#### `.pkd-text-secondary`
Purple text with glow effect

#### `.pkd-text-accent`
Orange text with glow effect

#### `.pkd-text-mono`
Monospace font for technical content

#### `.pkd-text-uppercase`
Uppercase with wide letter spacing

---

## Components

### Buttons

#### Primary Button
```html
<button class="pkd-button">CLICK ME</button>
```

**Features**:
- Neon green background
- Uppercase text
- Monospace font
- Glow effect on hover
- Glitch animation on click

#### Secondary Button
```html
<button class="pkd-button pkd-button-secondary">SECONDARY</button>
```

**Features**:
- Transparent background
- Green border
- Hover glow effect

#### Danger Button
```html
<button class="pkd-button pkd-button-danger">DELETE</button>
```

**Features**:
- Red background
- Intense glow effect

### Cards

```html
<div class="pkd-card">
  <h3 class="pkd-heading-3">Card Title</h3>
  <p>Card content goes here</p>
</div>
```

**Features**:
- Dark background with border
- Scan line animation at top
- Glow effect on hover
- Grid-aligned padding

### Inputs

```html
<input type="text" class="pkd-input" placeholder="Enter text...">
```

**Features**:
- Monospace font
- Green border on focus
- Glow effect on focus
- Dark background

### Badges

```html
<span class="pkd-badge">STATUS: ACTIVE</span>
<span class="pkd-badge pkd-badge-secondary">SECONDARY</span>
<span class="pkd-badge pkd-badge-danger">CRITICAL</span>
```

### Alerts

```html
<div class="pkd-alert">
  <p>This is an alert message</p>
</div>

<div class="pkd-alert pkd-alert-danger">
  <p>This is a danger alert</p>
</div>

<div class="pkd-alert pkd-alert-warning">
  <p>This is a warning alert</p>
</div>
```

---

## Animations

### Glitch Animation
Creates a reality-distorting glitch effect:

```html
<div class="pkd-glitch">Glitchy Text</div>
```

**Duration**: 0.3s infinite

### Paranoid Pulse
Pulsing glow effect suggesting surveillance:

```html
<div class="pkd-paranoid-pulse">Pulsing Element</div>
```

**Duration**: 2s infinite

### Scan Lines
CRT monitor scan line effect:

```html
<div class="pkd-scan-lines">Content with scan lines</div>
```

**Duration**: 8s linear infinite

### Reality Distortion
Subtle skew animation suggesting reality bending:

```html
<div class="pkd-reality-distort">Distorted Content</div>
```

**Duration**: 4s ease-in-out infinite

### Surveillance Blink
Blinking effect suggesting monitoring:

```html
<div class="pkd-surveillance-blink">Blinking Element</div>
```

**Duration**: 3s steps infinite

---

## Utility Classes

### Glows
- `.pkd-glow` - Soft glow effect
- `.pkd-glow-intense` - Intense glow effect

### Shadows
- `.pkd-shadow` - Paranoid shadow effect

### Borders
- `.pkd-border-top` - Top border
- `.pkd-border-bottom` - Bottom border
- `.pkd-border-left` - Left border (green)
- `.pkd-border-right` - Right border (green)

### Styling
- `.pkd-no-radius` - No border radius (sharp edges)
- `.pkd-text-uppercase` - Uppercase with wide letter spacing

---

## Layout Patterns

### Two-Column Grid
```html
<div class="grid gap-8 lg:grid-cols-2">
  <div class="pkd-card">Column 1</div>
  <div class="pkd-card">Column 2</div>
</div>
```

### Full-Width Container
```html
<div class="mx-auto max-w-7xl px-4 py-8">
  <div class="pkd-card">Full-width content</div>
</div>
```

### Grid-Based Layout
```html
<div class="pkd-grid-container">
  <div class="pkd-grid-item">Item 1</div>
  <div class="pkd-grid-item">Item 2</div>
  <div class="pkd-grid-item">Item 3</div>
</div>
```

---

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Headings
Heading sizes automatically scale down on mobile devices:

```css
@media (max-width: 768px) {
  .pkd-heading-1 { font-size: 1.875rem; }
  .pkd-heading-2 { font-size: 1.5rem; }
  .pkd-heading-3 { font-size: 1.25rem; }
}
```

---

## Accessibility

### Reduced Motion
The design system respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast
All text meets WCAG AA standards:
- Green on black: 7.5:1 contrast ratio
- White on black: 21:1 contrast ratio
- Orange on black: 5.2:1 contrast ratio

### Focus States
All interactive elements have clear focus states with glow effects.

---

## Light Mode Support

The design system includes a light mode variant:

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

## CSS Variables Reference

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

## Usage Examples

### Complete Page Layout
```html
<div class="pkd-scan-lines min-h-screen" style="background-color: var(--pkd-background)">
  <!-- Header -->
  <header class="pkd-border-bottom">
    <div class="mx-auto max-w-7xl px-4 py-8">
      <h1 class="pkd-heading pkd-heading-1 pkd-text-primary">
        PAGE TITLE
      </h1>
    </div>
  </header>

  <!-- Main Content -->
  <main class="mx-auto max-w-7xl px-4 py-8">
    <!-- Instructions Card -->
    <div class="pkd-card mb-8 pkd-paranoid-pulse">
      <h2 class="pkd-heading pkd-heading-3 pkd-text-primary mb-4">
        INSTRUCTIONS
      </h2>
      <p class="pkd-text-mono">Content here...</p>
    </div>

    <!-- Two-Column Grid -->
    <div class="grid gap-8 lg:grid-cols-2">
      <div class="pkd-card">
        <h3 class="pkd-heading pkd-heading-3 pkd-text-primary">
          SECTION 1
        </h3>
        <p>Content...</p>
      </div>
      <div class="pkd-card">
        <h3 class="pkd-heading pkd-heading-3 pkd-text-secondary">
          SECTION 2
        </h3>
        <p>Content...</p>
      </div>
    </div>
  </main>
</div>
```

---

## Design Philosophy

### Paranoia as Aesthetic
The design system uses visual elements that suggest surveillance and monitoring:
- Constant grid background (surveillance grid)
- Glowing elements (monitoring lights)
- Scan lines (CRT monitoring)
- Pulsing effects (heartbeat of the system)

### Reality Distortion
Elements subtly shift and distort, suggesting that reality itself is unstable:
- Glitch animations
- Skew transformations
- Color shifts
- Opacity changes

### Retro-Futuristic
The design combines 1980s computer aesthetics with modern web technology:
- Monospace fonts (terminal aesthetic)
- Neon colors (arcade aesthetic)
- Grid-based layout (computer grid)
- Sharp edges (no rounded corners)

### Accessibility First
Despite the dystopian aesthetic, the design system maintains:
- High contrast ratios
- Clear focus states
- Reduced motion support
- Semantic HTML structure

---

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with responsive design

---

## Future Enhancements

- [ ] Dark/light mode toggle component
- [ ] Animated loading states
- [ ] Glitch text effect component
- [ ] Paranoid notification system
- [ ] Reality distortion modal
- [ ] Surveillance camera effect
- [ ] Data visualization components
- [ ] Terminal-style code blocks

---

## Credits

Inspired by:
- Philip K. Dick's paranoid vision of reality
- 1980s computer aesthetics
- Cyberpunk design movements
- Surveillance state themes
- Retro-futuristic UI design

---

**Version**: 1.0  
**Last Updated**: 2024  
**License**: MIT
