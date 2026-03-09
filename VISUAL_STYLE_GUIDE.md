# Neo Philip K Dick Paranoid Future — Visual Style Guide

## 📋 Complete Component Reference

This guide shows every component in the design system with usage examples, code snippets, and visual specifications.

---

## 🎨 Color System

### Primary Colors

#### Neon Green (#00ff41)
- **Purpose**: Primary actions, surveillance indicators, active states
- **Variants**:
  - `--pkd-primary`: #00ff41 (main)
  - `--pkd-primary-dark`: #00cc33 (hover/active)
  - `--pkd-primary-light`: #33ff66 (highlights)
  - `--pkd-primary-glow`: rgba(0, 255, 65, 0.3) (soft glow)

**Usage**:
```tsx
<button className="pkd-button">ACTION</button>
<h1 className="pkd-text-primary">HEADLINE</h1>
<div className="pkd-border-left">Content</div>
```

#### Paranoid Purple (#7c3aed)
- **Purpose**: Secondary actions, reality distortion, alternative states
- **Variants**:
  - `--pkd-secondary`: #7c3aed (main)
  - `--pkd-secondary-dark`: #6d28d9 (hover/active)
  - `--pkd-secondary-light`: #a78bfa (highlights)
  - `--pkd-secondary-glow`: rgba(124, 58, 237, 0.3) (soft glow)

**Usage**:
```tsx
<button className="pkd-button pkd-button-secondary">SECONDARY</button>
<p className="pkd-text-secondary">Secondary text</p>
<span className="pkd-badge pkd-badge-secondary">BADGE</span>
```

#### Warning Orange (#ff6b35)
- **Purpose**: Warnings, alerts, danger indicators
- **Variants**:
  - `--pkd-accent`: #ff6b35 (main)
  - `--pkd-accent-dark`: #e55a2b (hover/active)
  - `--pkd-accent-light`: #ff8c5a (highlights)
  - `--pkd-accent-glow`: rgba(255, 107, 53, 0.3) (soft glow)

**Usage**:
```tsx
<p className="pkd-text-accent">Warning message</p>
<div className="pkd-alert pkd-alert-warning">Alert</div>
```

#### Destructive Red (#ef4444)
- **Purpose**: Critical actions, errors, threats
- **Variants**:
  - `--pkd-destructive`: #ef4444 (main)
  - `--pkd-destructive-dark`: #dc2626 (hover/active)
  - `--pkd-destructive-light`: #f87171 (highlights)

**Usage**:
```tsx
<button className="pkd-button pkd-button-danger">DELETE</button>
<p className="pkd-text-danger">Error message</p>
<div className="pkd-alert pkd-alert-danger">Critical</div>
```

#### Background Black (#0a0a0a)
- **Purpose**: Main background, void, darkness
- **Variants**:
  - `--pkd-background`: #0a0a0a (primary)
  - `--pkd-background-secondary`: #1a1a1a (cards, containers)
  - `--pkd-background-tertiary`: #2a2a2a (hover states)

#### Foreground White (#f5f5f5)
- **Purpose**: Text, content, foreground elements
- **Variants**:
  - `--pkd-foreground`: #f5f5f5 (main text)
  - `--pkd-foreground-muted`: #a0a0a0 (secondary text)

---

## 🔘 Buttons

### Primary Button
```tsx
<button className="pkd-button">PRIMARY ACTION</button>
```
- **Background**: Neon green (#00ff41)
- **Text**: Black
- **Border**: 2px solid green
- **Hover**: Intense glow, slight translate up
- **Active**: Return to normal position
- **Disabled**: 50% opacity

### Secondary Button
```tsx
<button className="pkd-button pkd-button-secondary">SECONDARY</button>
```
- **Background**: Transparent
- **Text**: Neon green
- **Border**: 2px solid green
- **Hover**: Green glow background
- **Use for**: Alternative actions, less important CTAs

### Danger Button
```tsx
<button className="pkd-button pkd-button-danger">DELETE</button>
```
- **Background**: Red (#ef4444)
- **Text**: White
- **Border**: 2px solid red
- **Hover**: Red glow effect
- **Use for**: Destructive actions, warnings

### Button States
- **Hover**: Box shadow glow, -2px -2px translate
- **Active**: No translate (pressed effect)
- **Disabled**: 50% opacity, cursor not-allowed
- **Focus**: Outline with glow

---

## 📝 Typography

### Headings

#### H1 (2.5rem)
```tsx
<h1 className="pkd-heading pkd-heading-1">MAIN TITLE</h1>
```
- **Font**: Courier New, monospace
- **Weight**: 900 (black)
- **Letter Spacing**: 0.05em (wide)
- **Transform**: UPPERCASE
- **Color**: Neon green with glow
- **Line Height**: 1.2

#### H2 (2rem)
```tsx
<h2 className="pkd-heading pkd-heading-2">SECTION TITLE</h2>
```
- **Font**: Courier New, monospace
- **Weight**: 900
- **Letter Spacing**: 0.05em
- **Transform**: UPPERCASE
- **Color**: Neon green with glow
- **Line Height**: 1.3

#### H3 (1.5rem)
```tsx
<h3 className="pkd-heading pkd-heading-3">SUBSECTION</h3>
```
- **Font**: Courier New, monospace
- **Weight**: 900
- **Letter Spacing**: 0.05em
- **Transform**: UPPERCASE
- **Color**: Neon green with glow
- **Line Height**: 1.4

### Body Text
```tsx
<p className="pkd-text-mono">Regular paragraph text</p>
```
- **Font**: Helvetica Neue, Arial, sans-serif
- **Size**: 1rem (16px)
- **Letter Spacing**: 0.02em (normal)
- **Color**: #f5f5f5
- **Line Height**: 1.5

### Text Utilities

#### Primary Text
```tsx
<p className="pkd-text-primary">Primary colored text</p>
```
- **Color**: Neon green (#00ff41)
- **Text Shadow**: Soft glow effect

#### Secondary Text
```tsx
<p className="pkd-text-secondary">Secondary colored text</p>
```
- **Color**: Purple (#7c3aed)
- **Text Shadow**: Purple glow effect

#### Accent Text
```tsx
<p className="pkd-text-accent">Accent colored text</p>
```
- **Color**: Orange (#ff6b35)
- **Text Shadow**: Orange glow effect

#### Monospace Text
```tsx
<p className="pkd-text-mono">Monospace text</p>
```
- **Font**: Courier New, monospace
- **Letter Spacing**: -0.02em (tight)
- **Use for**: Code, technical content, system messages

#### Uppercase Text
```tsx
<p className="pkd-text-uppercase">UPPERCASE TEXT</p>
```
- **Transform**: UPPERCASE
- **Letter Spacing**: 0.05em (wide)
- **Use for**: Labels, badges, emphasis

---

## 🏷️ Badges

### Primary Badge
```tsx
<span className="pkd-badge">STATUS: ACTIVE</span>
```
- **Background**: Green glow (rgba(0, 255, 65, 0.3))
- **Text**: Neon green
- **Border**: 1px solid green
- **Padding**: 4px 12px
- **Font**: Monospace, 0.75rem, bold
- **Letter Spacing**: 0.05em
- **Transform**: UPPERCASE

### Secondary Badge
```tsx
<span className="pkd-badge pkd-badge-secondary">SECONDARY</span>
```
- **Background**: Purple glow
- **Text**: Purple
- **Border**: 1px solid purple

### Danger Badge
```tsx
<span className="pkd-badge pkd-badge-danger">CRITICAL</span>
```
- **Background**: Red glow
- **Text**: Red
- **Border**: 1px solid red

---

## ⚠️ Alerts

### Standard Alert
```tsx
<div className="pkd-alert">
  <p>Standard alert message</p>
</div>
```
- **Border**: 2px solid green
- **Left Border**: 4px solid green (accent)
- **Background**: Dark secondary
- **Padding**: 16px
- **Border Radius**: 0 (sharp corners)

### Warning Alert
```tsx
<div className="pkd-alert pkd-alert-warning">
  <p>Warning alert message</p>
</div>
```
- **Border**: 2px solid orange
- **Left Border**: 4px solid orange
- **Use for**: Non-critical warnings

### Danger Alert
```tsx
<div className="pkd-alert pkd-alert-danger">
  <p>Danger alert message</p>
</div>
```
- **Border**: 2px solid red
- **Left Border**: 4px solid red
- **Use for**: Critical errors, threats

---

## 📋 Cards

### Basic Card
```tsx
<div className="pkd-card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```
- **Background**: Dark secondary (#1a1a1a)
- **Border**: 2px solid green (20% opacity)
- **Padding**: 24px
- **Position**: Relative (for pseudo-elements)
- **Overflow**: Hidden

### Card Features
- **Top Border**: Animated scan line effect
- **Hover**: Border becomes more visible, glow effect
- **Border Radius**: 0 (sharp, paranoid aesthetic)

---

## 🎬 Animations

### Paranoid Pulse
```tsx
<div className="pkd-card pkd-paranoid-pulse">
  Content
</div>
```
- **Duration**: 2s
- **Easing**: cubic-bezier(0.4, 0, 0.6, 1)
- **Effect**: Opacity 1 → 0.7 → 1, glow intensifies
- **Use for**: Active states, surveillance indicators

### Scan Lines
```tsx
<div className="pkd-scan-lines">
  Content
</div>
```
- **Duration**: 8s
- **Easing**: Linear
- **Effect**: Horizontal lines sweep top to bottom
- **Use for**: CRT monitor effect, technical feel

### Reality Distortion
```tsx
<div className="pkd-reality-distort">
  Content
</div>
```
- **Duration**: 4s
- **Easing**: ease-in-out
- **Effect**: Subtle skew transformations
- **Use for**: Unsettling, paranoid atmosphere

### Surveillance Blink
```tsx
<div className="pkd-surveillance-blink">
  Content
</div>
```
- **Duration**: 3s
- **Easing**: steps(1, end)
- **Effect**: Opacity 1 → 0.3 → 1 (stepped)
- **Use for**: Monitoring indicators, blinking lights

### Glitch Effect
```tsx
<p className="pkd-glitch">GLITCH TEXT</p>
```
- **Duration**: 0.3s
- **Easing**: Linear
- **Effect**: Random clip-path and translate
- **Use for**: Error states, reality breaks

### Spinner
```tsx
<div className="pkd-spinner"></div>
```
- **Duration**: 0.8s
- **Easing**: Linear
- **Effect**: 360° rotation
- **Use for**: Loading states

---

## 📥 Form Inputs

### Text Input
```tsx
<input type="text" className="pkd-input" placeholder="Enter text..." />
```
- **Background**: Dark secondary
- **Border**: 2px solid green (20% opacity)
- **Color**: White
- **Padding**: 12px 16px
- **Font**: Monospace, 0.875rem
- **Focus**: Border becomes bright green, glow effect

### Select
```tsx
<select className="pkd-input">
  <option>Option 1</option>
</select>
```
- **Same styling as text input**
- **Focus**: Same glow effect

### Textarea
```tsx
<textarea className="pkd-input" rows={4}></textarea>
```
- **Same styling as text input**
- **Resizable**: Yes
- **Focus**: Same glow effect

### Input States
- **Default**: Muted border, dark background
- **Focus**: Bright green border, glow, lighter background
- **Placeholder**: Muted text (60% opacity)
- **Disabled**: 50% opacity

---

## 🔲 Grid Layout

### Grid Container
```tsx
<div className="pkd-grid-container">
  <div className="pkd-grid-item">Item 1</div>
  <div className="pkd-grid-item">Item 2</div>
</div>
```
- **Display**: CSS Grid
- **Columns**: auto-fit, minmax(8px, 1fr)
- **Gap**: 8px
- **Padding**: 16px
- **Grid Size**: 8px (visible background grid)

### Grid Item
- **Background**: Dark secondary
- **Border**: 2px solid green (20% opacity)
- **Padding**: 16px
- **Hover**: Border brightens, glow effect

---

## 🎯 Utility Classes

### Glow Effects
```tsx
<div className="pkd-glow">Medium glow</div>
<div className="pkd-glow-intense">Intense glow</div>
```

### Shadow
```tsx
<div className="pkd-shadow">Paranoid shadow</div>
```

### Borders
```tsx
<div className="pkd-border-top">Top border</div>
<div className="pkd-border-bottom">Bottom border</div>
<div className="pkd-border-left">Left border (green)</div>
<div className="pkd-border-right">Right border (green)</div>
```

### Divider
```tsx
<hr className="pkd-divider" />
```
- **Height**: 2px
- **Gradient**: Transparent → green → transparent
- **Margin**: 16px 0

### No Radius
```tsx
<div className="pkd-no-radius">Sharp corners</div>
```
- **Border Radius**: 0
- **Use for**: Maintaining paranoid aesthetic

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Typography
```
H1: 2.5rem (desktop) → 1.875rem (mobile)
H2: 2rem (desktop) → 1.5rem (mobile)
H3: 1.5rem (desktop) → 1.25rem (mobile)
```

### Responsive Grid
```
Desktop: repeat(auto-fit, minmax(8px, 1fr))
Mobile: repeat(auto-fit, minmax(32px, 1fr))
```

---

## ♿ Accessibility

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
- **Respects**: User's motion preferences
- **Disables**: All animations for accessibility

### Light Mode Support
```css
@media (prefers-color-scheme: light) {
  :root {
    --pkd-background: #f5f5f5;
    --pkd-foreground: #0a0a0a;
    /* ... other adjustments ... */
  }
}
```
- **Supports**: Light mode preference
- **Maintains**: Contrast ratios (WCAG AA)

### Focus States
- **All interactive elements**: Clear focus outline with glow
- **Keyboard navigation**: Fully supported
- **Semantic HTML**: Used throughout

### Color Contrast
- **Text on background**: 7:1 ratio (WCAG AAA)
- **Interactive elements**: 4.5:1 ratio (WCAG AA)
- **Borders**: Sufficient contrast for visibility

---

## 🎨 Design Tokens

### Spacing (8px grid)
```
--pkd-grid-size: 8px
Multiples: 8px, 16px, 24px, 32px, 40px, 48px...
```

### Transitions
```
--pkd-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--pkd-transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1)
--pkd-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Z-Index Scale
```
--pkd-z-base: 1
--pkd-z-dropdown: 100
--pkd-z-sticky: 200
--pkd-z-fixed: 300
--pkd-z-modal: 400
--pkd-z-tooltip: 500
```

### Shadows & Glows
```
--pkd-glow-soft: 0 0 10px rgba(0, 255, 65, 0.2)
--pkd-glow-medium: 0 0 20px rgba(0, 255, 65, 0.4)
--pkd-glow-intense: 0 0 30px rgba(0, 255, 65, 0.6)
--pkd-shadow-paranoid: 0 0 20px rgba(0, 0, 0, 0.8)
```

---

## 🚀 Quick Reference

### Most Common Classes
```tsx
// Headings
<h1 className="pkd-heading pkd-heading-1">Title</h1>

// Buttons
<button className="pkd-button">Action</button>

// Cards
<div className="pkd-card">Content</div>

// Text
<p className="pkd-text-primary">Primary text</p>

// Alerts
<div className="pkd-alert">Message</div>

// Inputs
<input className="pkd-input" />

// Animations
<div className="pkd-paranoid-pulse">Pulsing</div>
```

---

## 📚 Component Combinations

### Alert with Icon
```tsx
<div className="pkd-alert pkd-alert-warning">
  <div className="flex items-center gap-3">
    <span className="text-2xl">⚠️</span>
    <p className="pkd-text-mono">Warning message</p>
  </div>
</div>
```

### Card with Badge
```tsx
<div className="pkd-card">
  <div className="flex justify-between items-start mb-4">
    <h3 className="pkd-heading pkd-heading-3">Title</h3>
    <span className="pkd-badge">ACTIVE</span>
  </div>
  <p>Content</p>
</div>
```

### Button Group
```tsx
<div className="flex gap-3">
  <button className="pkd-button">Primary</button>
  <button className="pkd-button pkd-button-secondary">Secondary</button>
  <button className="pkd-button pkd-button-danger">Danger</button>
</div>
```

### Form Section
```tsx
<div className="pkd-card">
  <h3 className="pkd-heading pkd-heading-3 mb-6">Form Title</h3>
  <div className="space-y-4">
    <div>
      <label className="pkd-text-primary block mb-2 text-sm font-bold">
        Label
      </label>
      <input className="pkd-input w-full" />
    </div>
  </div>
</div>
```

---

## 🎭 Theming

### Using CSS Variables
```tsx
// Access any design token
<div style={{ color: 'var(--pkd-primary)' }}>
  Colored text
</div>

// Or use Tailwind with custom config
<div className="text-[var(--pkd-primary)]">
  Colored text
</div>
```

### Custom Color Combinations
```tsx
// Create custom combinations
<div style={{
  backgroundColor: 'var(--pkd-background-secondary)',
  borderColor: 'var(--pkd-primary)',
  color: 'var(--pkd-foreground)',
}}>
  Custom styled element
</div>
```

---

## 📖 Design Philosophy

### Paranoid Aesthetic
- **Sharp corners**: No border-radius (except spinner)
- **Monospace typography**: Technical, clinical feel
- **Neon colors**: Surveillance, monitoring
- **Grid background**: Structured, controlled environment
- **Animations**: Unsettling, reality-bending

### Accessibility First
- **High contrast**: WCAG AA/AAA compliant
- **Reduced motion**: Respects user preferences
- **Semantic HTML**: Proper structure
- **Keyboard navigation**: Fully supported
- **Light mode**: Alternative color scheme

### Performance
- **CSS-only animations**: No JavaScript overhead
- **Minimal dependencies**: Pure CSS design system
- **Optimized selectors**: Fast rendering
- **Reusable classes**: DRY principles

---

## 🔗 Integration Examples

See `INTEGRATION_EXAMPLES.md` for:
- React component patterns
- Common use cases
- Best practices
- Code snippets
- Real-world examples

