/**
 * Neo Philip K Dick Paranoid Future Design System Showcase
 * 
 * This component demonstrates all the design system elements,
 * colors, animations, and components available.
 */

export function PKDShowcase() {
  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      {/* HEADER */}
      <header className="pkd-border-bottom" style={{ borderColor: 'var(--pkd-border-color)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="pkd-heading pkd-heading-1 pkd-text-primary">
            NEO PHILIP K DICK PARANOID FUTURE
          </h1>
          <p className="pkd-text-mono mt-3 text-sm" style={{ color: 'var(--pkd-foreground-muted)' }}>
            [ DESIGN SYSTEM SHOWCASE ] Complete component library and color palette
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* SECTION 1: COLOR PALETTE */}
        <section className="mb-12">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-6">
            COLOR PALETTE
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Primary Green */}
            <div className="pkd-card">
              <div
                className="h-24 mb-4 border-2"
                style={{
                  backgroundColor: 'var(--pkd-primary)',
                  borderColor: 'var(--pkd-primary)',
                  boxShadow: 'var(--pkd-glow-intense)',
                }}
              ></div>
              <h3 className="pkd-text-primary font-bold mb-2">PRIMARY</h3>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                #00ff41 | Surveillance, Monitoring
              </p>
            </div>

            {/* Secondary Purple */}
            <div className="pkd-card">
              <div
                className="h-24 mb-4 border-2"
                style={{
                  backgroundColor: 'var(--pkd-secondary)',
                  borderColor: 'var(--pkd-secondary)',
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.6)',
                }}
              ></div>
              <h3 className="pkd-text-secondary font-bold mb-2">SECONDARY</h3>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                #7c3aed | Reality Distortion
              </p>
            </div>

            {/* Accent Orange */}
            <div className="pkd-card">
              <div
                className="h-24 mb-4 border-2"
                style={{
                  backgroundColor: 'var(--pkd-accent)',
                  borderColor: 'var(--pkd-accent)',
                  boxShadow: '0 0 20px rgba(255, 107, 53, 0.6)',
                }}
              ></div>
              <h3 className="pkd-text-accent font-bold mb-2">ACCENT</h3>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                #ff6b35 | Warning, Danger
              </p>
            </div>

            {/* Destructive Red */}
            <div className="pkd-card">
              <div
                className="h-24 mb-4 border-2"
                style={{
                  backgroundColor: 'var(--pkd-destructive)',
                  borderColor: 'var(--pkd-destructive)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                }}
              ></div>
              <h3 className="pkd-text-danger font-bold mb-2">DESTRUCTIVE</h3>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                #ef4444 | Critical, Threat
              </p>
            </div>

            {/* Background Black */}
            <div className="pkd-card">
              <div
                className="h-24 mb-4 border-2"
                style={{
                  backgroundColor: 'var(--pkd-background)',
                  borderColor: 'var(--pkd-primary)',
                }}
              ></div>
              <h3 className="pkd-text-primary font-bold mb-2">BACKGROUND</h3>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                #0a0a0a | Void, Darkness
              </p>
            </div>

            {/* Foreground White */}
            <div className="pkd-card">
              <div
                className="h-24 mb-4 border-2"
                style={{
                  backgroundColor: 'var(--pkd-foreground)',
                  borderColor: 'var(--pkd-primary)',
                }}
              ></div>
              <h3 className="pkd-text-primary font-bold mb-2">FOREGROUND</h3>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                #f5f5f5 | Text, Content
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: BUTTONS */}
        <section className="mb-12">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-6">
            BUTTONS
          </h2>
          
          <div className="pkd-card">
            <div className="flex flex-wrap gap-4">
              <button className="pkd-button">PRIMARY BUTTON</button>
              <button className="pkd-button pkd-button-secondary">SECONDARY BUTTON</button>
              <button className="pkd-button pkd-button-danger">DANGER BUTTON</button>
              <button className="pkd-button" disabled style={{ opacity: 0.5 }}>
                DISABLED BUTTON
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: TEXT STYLES */}
        <section className="mb-12">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-6">
            TEXT STYLES
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="pkd-card">
              <h3 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">
                HEADING 1
              </h3>
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                This is a paragraph with normal text. It uses the sans-serif font family and has standard letter spacing.
              </p>
            </div>

            <div className="pkd-card">
              <h3 className="pkd-heading pkd-heading-3 pkd-text-secondary mb-4">
                HEADING 2
              </h3>
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                This is a paragraph with monospace text. It uses the monospace font family for technical content.
              </p>
            </div>

            <div className="pkd-card">
              <p className="pkd-text-primary text-lg font-bold mb-2">PRIMARY TEXT</p>
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                Text with primary color and glow effect
              </p>
            </div>

            <div className="pkd-card">
              <p className="pkd-text-secondary text-lg font-bold mb-2">SECONDARY TEXT</p>
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                Text with secondary color and glow effect
              </p>
            </div>

            <div className="pkd-card">
              <p className="pkd-text-accent text-lg font-bold mb-2">ACCENT TEXT</p>
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                Text with accent color and glow effect
              </p>
            </div>

            <div className="pkd-card">
              <p className="pkd-text-uppercase text-lg font-bold mb-2">UPPERCASE TEXT</p>
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                Text with uppercase transformation and wide letter spacing
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: BADGES & ALERTS */}
        <section className="mb-12">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-6">
            BADGES & ALERTS
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="pkd-card">
              <h3 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">BADGES</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pkd-badge">STATUS: ACTIVE</span>
                <span className="pkd-badge pkd-badge-secondary">SECONDARY</span>
                <span className="pkd-badge pkd-badge-danger">CRITICAL</span>
              </div>
            </div>

            <div className="pkd-card">
              <h3 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">ALERTS</h3>
              <div className="space-y-3">
                <div className="pkd-alert">
                  <p className="pkd-text-mono text-sm">Standard alert message</p>
                </div>
                <div className="pkd-alert pkd-alert-warning">
                  <p className="pkd-text-mono text-sm">Warning alert message</p>
                </div>
                <div className="pkd-alert pkd-alert-danger">
                  <p className="pkd-text-mono text-sm">Danger alert message</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: ANIMATIONS */}
        <section className="mb-12">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-6">
            ANIMATIONS
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="pkd-card pkd-paranoid-pulse">
              <p className="pkd-text-primary font-bold mb-2">PARANOID PULSE</p>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                Pulsing glow effect suggesting surveillance
              </p>
            </div>

            <div className="pkd-card pkd-scan-lines">
              <p className="pkd-text-primary font-bold mb-2">SCAN LINES</p>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                CRT monitor scan line effect
              </p>
            </div>

            <div className="pkd-card pkd-reality-distort">
              <p className="pkd-text-primary font-bold mb-2">REALITY DISTORT</p>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                Subtle skew animation
              </p>
            </div>

            <div className="pkd-card pkd-surveillance-blink">
              <p className="pkd-text-primary font-bold mb-2">SURVEILLANCE BLINK</p>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                Blinking effect suggesting monitoring
              </p>
            </div>

            <div className="pkd-card">
              <div className="pkd-spinner mb-4"></div>
              <p className="pkd-text-primary font-bold mb-2">SPINNER</p>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                Loading spinner animation
              </p>
            </div>

            <div className="pkd-card">
              <p className="pkd-glitch font-bold mb-2" style={{ color: 'var(--pkd-primary)' }}>
                GLITCH TEXT
              </p>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                Reality-distorting glitch effect
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: INPUTS */}
        <section className="mb-12">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-6">
            FORM INPUTS
          </h2>
          
          <div className="pkd-card">
            <div className="space-y-4">
              <div>
                <label className="pkd-text-primary block mb-2 text-sm font-bold">
                  TEXT INPUT
                </label>
                <input
                  type="text"
                  className="pkd-input w-full"
                  placeholder="Enter text..."
                />
              </div>

              <div>
                <label className="pkd-text-primary block mb-2 text-sm font-bold">
                  SELECT
                </label>
                <select className="pkd-input w-full">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>

              <div>
                <label className="pkd-text-primary block mb-2 text-sm font-bold">
                  TEXTAREA
                </label>
                <textarea
                  className="pkd-input w-full"
                  placeholder="Enter text..."
                  rows={4}
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: GRID LAYOUT */}
        <section className="mb-12">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-6">
            GRID LAYOUT
          </h2>
          
          <div className="pkd-grid-container">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="pkd-grid-item">
                <p className="pkd-text-primary font-bold">ITEM {i + 1}</p>
                <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                  Grid-aligned content
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <div className="pkd-alert mt-12 text-center">
          <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground)' }}>
            <span className="pkd-text-primary">[ SYSTEM STATUS ]</span> Neo Philip K Dick Paranoid Future Design System v1.0 | Grid: 8px | Surveillance Active
          </p>
        </div>
      </main>
    </div>
  );
}
