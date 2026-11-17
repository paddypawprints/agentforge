# Alpine Spring — quick start

The stylesheet is already imported in `src/index.tsx`:

```ts
import './styles/neo-pkd-design-system.css';
```

Match the live screen in `src/App.tsx`. A section is a card, a mono definition, and a primary or secondary button:

```tsx
<div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
  <header className="pkd-border-bottom">
    <h1 className="pkd-heading pkd-heading-2 pkd-text-primary">AI AGENTS</h1>
  </header>
  <section className="pkd-card">
    <h2 className="pkd-text-mono" style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>
      MODEL
    </h2>
    <p className="pkd-text-mono" style={{ color: 'var(--pkd-foreground-muted)' }}>
      A model receives text and returns text.
    </p>
    <button className="pkd-button">[ SEND → AGENT ]</button>
  </section>
</div>
```

`pkd-scan-lines` is kept so existing markup stays valid. It draws nothing.

The full screen, color roles, and hop pattern are in [DESIGN_SYSTEM_MANIFEST.txt](DESIGN_SYSTEM_MANIFEST.txt). Classes are in [src/styles/NEO_PKD_DESIGN_SYSTEM.md](src/styles/NEO_PKD_DESIGN_SYSTEM.md).
