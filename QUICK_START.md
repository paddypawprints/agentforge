# Neo Philip K Dick Paranoid Future Design System — Quick Start

## 🚀 Get Started in 30 Seconds

### 1. The Design System is Already Imported
```typescript
// src/index.tsx
import '"'"'./styles/neo-pkd-design-system.css'"'"';
```

### 2. Use PKD Classes in Your Components
```tsx
import React from '"'"'react'"'"';

export function MyComponent() {
  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: '"'"'var(--pkd-background)'"'"' }}>
      {/* Header */}
      <header className="pkd-border-bottom">
        <h1 className="pkd-heading pkd-heading-1 pkd-text-primary">
          PARANOID FUTURE
        </h1>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Card with Paranoid Pulse Animation */}
        <div className="pkd-card pkd-paranoid-pulse">
          <h2 className="pkd-heading pkd-heading-3 pkd-text-primary">
            SURVEILLANCE ACTIVE
          </h2>
          <p className="pkd-text-mono">Content here...</p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="pkd-card">
            <h3 className="pkd-heading pkd-heading-3 pkd-text-primary">
              SECTION 1
            </h3>
            <p className="pkd-text-mono">Content...</p>
          </div>
          <div className="pkd-card">
            <h3 className="pkd-heading pkd-heading-3 pkd-text-secondary">
              SECTION 2
            </h3>
            <p className="pkd-text-mono">Content...</p>
          </div>
        </div>

        {/* Buttons */}
        <button className="pkd-button">PRIMARY BUTTON</button>
        <button className="pkd-button pkd-button-secondary">SECONDARY</button>
        <button className="pkd-button pkd-button-danger">DANGER</button>

        {/* Inputs */}
        <input type="text" className="pkd-input" placeholder="Enter text..." />
        <select className="pkd-input">
          <option>Option 1</option>
        </select>

        {/* Badges */}
        <span className="pkd-badge">STATUS: ACTIVE</span>
        <span className="pkd-badge pkd-badge-secondary">SECONDARY</span>

        {/* Alerts */}
        <div className="pkd-alert">Standard alert</div>
        <div className="pkd-alert pkd-alert-warning">Warning alert</div>
        <div className="pkd-alert pkd-alert-danger">Danger alert</div>
      </main>
    </div>
  );
}
```

---

## 🎨 Color Palette

```css
/* Primary - Surveillance Green */
color: var(--pkd-primary);  /* #00ff41 */

/* Secondary - Paranoid Purple */
color: var(--pkd-secondary);  /* #7c3aed */

/* Accent - Warning Orange */
color: var(--pkd-accent);  /* #ff6b35 */

/* Destructive - Paranoid Red */
color: var(--pkd-destructive);  /* #ef4444 */

/* Background - Deep Black */
background-color: var(--pkd-background);  /* #0a0a0a */

/* Foreground - Bright White */
color: var(--pkd-foreground);  /* #f5f5f5 */
```

---

## 🏗️ Grid System

All spacing uses **8px base unit**:

```css
--pkd-grid-size: 8px
```

Spacing multiples:
- `8px` (1 unit) = `calc(var(--pkd-grid-size) * 1)`
- `16px` (2 units) = `calc(var(--pkd-grid-size) * 2)`
- `24px` (3 units) = `calc(var(--pkd-grid-size) * 3)`
- `32px` (4 units) = `calc(var(--pkd-grid-size) * 4)`

---

## 🔤 Typography

### Headings
```tsx
<h1 className="pkd-heading pkd-heading-1">2.5rem</h1>
<h2 className="pkd-heading pkd-heading-2">2rem</h2>
<h3 className="pkd-heading pkd-heading-3">1.5rem</h3>
```

### Text Styles
```tsx
<p className="pkd-text-primary">Green text with glow</p>
<p className="pkd-text-secondary">Purple text with glow</p>
<p className="pkd-text-accent">Orange text with glow</p>
<p className="pkd-text-mono">Monospace font</p>
<p className="pkd-text-uppercase">UPPERCASE WITH WIDE SPACING</p>
```

---

## ✨ Animations

### Paranoid Pulse
Pulsing glow effect (2s):
```tsx
<div className="pkd-paranoid-pulse">Pulsing Element</div>
```

### Scan Lines
CRT monitor effect (8s):
```tsx
<div className="pkd-scan-lines">Content with scan lines</div>
```

### Reality Distortion
Subtle skew animation (4s):
```tsx
<div className="pkd-reality-distort">Distorted Content</div>
```

### Surveillance Blink
Blinking effect (3s):
```tsx
<div className="pkd-surveillance-blink">Blinking Element</div>
```

### Glitch
Reality-distorting glitch (0.3s):
```tsx
<div className="pkd-glitch">Glitchy Text</div>
```

### Spinner
Loading animation:
```tsx
<div className="pkd-spinner"></div>
```

---

## 🎯 Common Patterns

### Full-Width Container
```tsx
<div className="mx-auto max-w-7xl px-4 py-8">
  <div className="pkd-card">Content</div>
</div>
```

### Two-Column Grid
```tsx
<div className="grid gap-8 lg:grid-cols-2">
  <div className="pkd-card">Column 1</div>
  <div className="pkd-card">Column 2</div>
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

### Card with Glow
```tsx
<div className="pkd-card pkd-paranoid-pulse">
  <h3 className="pkd-heading pkd-heading-3 pkd-text-primary">
    Title
  </h3>
  <p className="pkd-text-mono">Content</p>
</div>
```

---

## 📚 Documentation

- **Detailed Reference**: `src/styles/NEO_PKD_DESIGN_SYSTEM.md`
- **Quick Start Guide**: `PKD_DESIGN_SYSTEM_README.md`
- **Component Showcase**: View `PKDShowcase` component
- **Summary**: `DESIGN_SYSTEM_SUMMARY.md`

---

## 🎓 Learn More

1. **View the Showcase**: Import `PKDShowcase` to see all components
2. **Read the Docs**: Check `NEO_PKD_DESIGN_SYSTEM.md` for detailed reference
3. **Explore the Code**: Look at `src/App.tsx` for real-world usage
4. **Customize**: Modify CSS variables in `neo-pkd-design-system.css`

---

## 💡 Tips

- Use `.pkd-scan-lines` on the root container for grid background
- Combine animations: `<div className="pkd-card pkd-paranoid-pulse">`
- All colors have CSS variables: `var(--pkd-primary)`, `var(--pkd-secondary)`, etc.
- Responsive: Use Tailwind breakpoints with PKD classes
- Accessible: Respects `prefers-reduced-motion` and has high contrast

---

## 🚀 You'"'"'re Ready!

Start using the design system in your components. The CSS is already imported and ready to go!

```tsx
<div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: '"'"'var(--pkd-background)'"'"' }}>
  <h1 className="pkd-heading pkd-heading-1 pkd-text-primary">
    BUILD SOMETHING PARANOID
  </h1>
</div>
```

---

**Version**: 1.0  
**Status**: Production Ready ✅
EOF
cat /workspace/QUICK_START.md
