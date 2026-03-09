# Neo Philip K Dick Paranoid Future — Integration Examples

## 🚀 Real-World Implementation Patterns

This guide provides copy-paste ready examples for common use cases and component combinations.

---

## 📱 Page Layouts

### Full-Page Layout with Header & Footer

```tsx
import React from 'react';

export function ParanoidPage() {
  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      {/* HEADER */}
      <header className="pkd-border-bottom sticky top-0 z-50" style={{ borderColor: 'var(--pkd-border-color)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="pkd-heading pkd-heading-2 pkd-text-primary">
              SYSTEM INTERFACE
            </h1>
            <nav className="flex gap-4">
              <button className="pkd-button pkd-button-secondary text-sm">DASHBOARD</button>
              <button className="pkd-button pkd-button-secondary text-sm">SETTINGS</button>
              <button className="pkd-button pkd-button-secondary text-sm">LOGOUT</button>
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="pkd-card sticky top-24">
              <h3 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">NAVIGATION</h3>
              <nav className="space-y-2">
                <a href="#" className="block pkd-text-primary hover:pkd-text-secondary transition">
                  → System Status
                </a>
                <a href="#" className="block pkd-text-primary hover:pkd-text-secondary transition">
                  → Data Streams
                </a>
                <a href="#" className="block pkd-text-primary hover:pkd-text-secondary transition">
                  → Surveillance Logs
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <section className="md:col-span-2">
            <div className="pkd-card mb-6">
              <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-4">MAIN CONTENT</h2>
              <p className="pkd-text-mono mb-4">
                This is the main content area. Use cards to organize information hierarchically.
              </p>
              <button className="pkd-button">TAKE ACTION</button>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="pkd-border-top mt-12" style={{ borderColor: 'var(--pkd-border-color)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="pkd-text-mono text-xs text-center" style={{ color: 'var(--pkd-foreground-muted)' }}>
            [ SYSTEM STATUS ] All systems operational | Surveillance: ACTIVE | Last sync: 2 minutes ago
          </p>
        </div>
      </footer>
    </div>
  );
}
```

---

## 🔐 Authentication Forms

### Login Form

```tsx
import React, { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    if (!email || !password) {
      setError('All fields required');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--pkd-background)' }}>
      <div className="w-full max-w-md">
        <div className="pkd-card">
          <h1 className="pkd-heading pkd-heading-2 pkd-text-primary mb-2 text-center">
            AUTHENTICATION
          </h1>
          <p className="pkd-text-mono text-xs text-center mb-6" style={{ color: 'var(--pkd-foreground-muted)' }}>
            [ SECURE LOGIN REQUIRED ]
          </p>

          {error && (
            <div className="pkd-alert pkd-alert-danger mb-6">
              <p className="pkd-text-mono text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="pkd-text-primary block mb-2 text-sm font-bold">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                className="pkd-input w-full"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="pkd-text-primary block mb-2 text-sm font-bold">
                PASSWORD
              </label>
              <input
                type="password"
                className="pkd-input w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="pkd-button w-full">
              AUTHENTICATE
            </button>
          </form>

          <hr className="pkd-divider my-6" />

          <p className="pkd-text-mono text-xs text-center" style={{ color: 'var(--pkd-foreground-muted)' }}>
            Don't have an account? <a href="#" className="pkd-text-primary hover:underline">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Signup Form

```tsx
import React, { useState } from 'react';

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name required';
    if (!formData.email) newErrors.email = 'Email required';
    if (formData.password.length < 8) newErrors.password = 'Password must be 8+ characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Handle signup
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--pkd-background)' }}>
      <div className="w-full max-w-md">
        <div className="pkd-card">
          <h1 className="pkd-heading pkd-heading-2 pkd-text-primary mb-2 text-center">
            CREATE ACCOUNT
          </h1>
          <p className="pkd-text-mono text-xs text-center mb-6" style={{ color: 'var(--pkd-foreground-muted)' }}>
            [ SYSTEM REGISTRATION ]
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="pkd-text-primary block mb-2 text-sm font-bold">
                FULL NAME
              </label>
              <input
                type="text"
                name="name"
                className="pkd-input w-full"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="pkd-text-danger text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="pkd-text-primary block mb-2 text-sm font-bold">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                name="email"
                className="pkd-input w-full"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="pkd-text-danger text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="pkd-text-primary block mb-2 text-sm font-bold">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                className="pkd-input w-full"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="pkd-text-danger text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="pkd-text-primary block mb-2 text-sm font-bold">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="pkd-input w-full"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <p className="pkd-text-danger text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="pkd-button w-full">
              CREATE ACCOUNT
            </button>
          </form>

          <hr className="pkd-divider my-6" />

          <p className="pkd-text-mono text-xs text-center" style={{ color: 'var(--pkd-foreground-muted)' }}>
            Already have an account? <a href="#" className="pkd-text-primary hover:underline">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Data Display

### Data Table

```tsx
import React from 'react';

interface DataRow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'warning';
  timestamp: string;
}

export function DataTable({ data }: { data: DataRow[] }) {
  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'pkd-badge',
      inactive: 'pkd-badge pkd-badge-secondary',
      warning: 'pkd-badge pkd-badge-danger',
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  return (
    <div className="pkd-card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="pkd-border-bottom" style={{ borderColor: 'var(--pkd-border-color)' }}>
            <th className="pkd-text-primary text-left py-3 px-4 font-bold text-sm">ID</th>
            <th className="pkd-text-primary text-left py-3 px-4 font-bold text-sm">NAME</th>
            <th className="pkd-text-primary text-left py-3 px-4 font-bold text-sm">STATUS</th>
            <th className="pkd-text-primary text-left py-3 px-4 font-bold text-sm">TIMESTAMP</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id}
              className={idx % 2 === 0 ? '' : 'bg-opacity-50'}
              style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--pkd-background-tertiary)' }}
            >
              <td className="pkd-text-mono text-xs py-3 px-4">{row.id}</td>
              <td className="pkd-text-mono text-xs py-3 px-4">{row.name}</td>
              <td className="py-3 px-4">
                <span className={getStatusBadge(row.status)}>
                  {row.status.toUpperCase()}
                </span>
              </td>
              <td className="pkd-text-mono text-xs py-3 px-4" style={{ color: 'var(--pkd-foreground-muted)' }}>
                {row.timestamp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Stats Dashboard

```tsx
import React from 'react';

interface StatCard {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export function StatsDashboard({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="pkd-card pkd-paranoid-pulse">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="pkd-text-mono text-xs mb-2" style={{ color: 'var(--pkd-foreground-muted)' }}>
                {stat.label}
              </p>
              <p className="pkd-heading pkd-heading-3 pkd-text-primary">
                {stat.value}
              </p>
            </div>
            {stat.icon && <span className="text-2xl">{stat.icon}</span>}
          </div>
          {stat.trend && (
            <div className="flex items-center gap-2">
              <span className={stat.trend === 'up' ? 'pkd-text-primary' : stat.trend === 'down' ? 'pkd-text-danger' : 'pkd-text-secondary'}>
                {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
              </span>
              <span className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                {stat.trend === 'up' ? '+12%' : stat.trend === 'down' ? '-8%' : 'Stable'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Modal & Dialog

### Confirmation Dialog

```tsx
import React, { useState } from 'react';

export function ConfirmationDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="w-full max-w-md">
        <div className="pkd-card">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-4">
            {title}
          </h2>
          <p className="pkd-text-mono mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="pkd-button pkd-button-secondary flex-1"
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              className="pkd-button pkd-button-danger flex-1"
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Alert Dialog

```tsx
import React from 'react';

export function AlertDialog({
  title,
  message,
  type = 'info',
  onClose,
}: {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
  onClose: () => void;
}) {
  const alertClass = type === 'error' ? 'pkd-alert-danger' : type === 'warning' ? 'pkd-alert-warning' : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="w-full max-w-md">
        <div className="pkd-card">
          <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-4">
            {title}
          </h2>

          <div className={`pkd-alert ${alertClass} mb-6`}>
            <p className="pkd-text-mono text-sm">{message}</p>
          </div>

          <button onClick={onClose} className="pkd-button w-full">
            ACKNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔔 Notifications

### Toast Notification

```tsx
import React, { useEffect, useState } from 'react';

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const alertClass = type === 'error' ? 'pkd-alert-danger' : type === 'warning' ? 'pkd-alert-warning' : '';

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm z-50 animate-in">
      <div className={`pkd-alert ${alertClass}`}>
        <p className="pkd-text-mono text-sm">{message}</p>
      </div>
    </div>
  );
}
```

### Notification Center

```tsx
import React from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error';
}

export function NotificationCenter({ notifications }: { notifications: Notification[] }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="pkd-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="pkd-heading pkd-heading-3 pkd-text-primary">
          NOTIFICATIONS
        </h3>
        {unreadCount > 0 && (
          <span className="pkd-badge pkd-badge-danger">
            {unreadCount} NEW
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`pkd-alert ${notif.type === 'error' ? 'pkd-alert-danger' : notif.type === 'warning' ? 'pkd-alert-warning' : ''}`}
            style={{ opacity: notif.read ? 0.6 : 1 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="pkd-text-primary font-bold text-sm">{notif.title}</p>
                <p className="pkd-text-mono text-xs mt-1">{notif.message}</p>
              </div>
              <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                {notif.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔍 Search & Filter

### Search Bar

```tsx
import React, { useState } from 'react';

export function SearchBar({
  onSearch,
  placeholder = 'SEARCH SYSTEM...',
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="pkd-input w-full pr-12"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 pkd-text-primary hover:pkd-text-secondary transition"
        onClick={() => {
          setQuery('');
          onSearch('');
        }}
      >
        ✕
      </button>
    </div>
  );
}
```

### Filter Panel

```tsx
import React, { useState } from 'react';

export function FilterPanel({
  onFilterChange,
}: {
  onFilterChange: (filters: Record<string, string[]>) => void;
}) {
  const [filters, setFilters] = useState<Record<string, string[]>>({
    status: [],
    priority: [],
    category: [],
  });

  const handleToggle = (category: string, value: string) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(v => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      onFilterChange(updated);
      return updated;
    });
  };

  return (
    <div className="pkd-card">
      <h3 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">FILTERS</h3>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <p className="pkd-text-primary text-sm font-bold mb-2">STATUS</p>
          <div className="space-y-2">
            {['active', 'inactive', 'pending'].map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleToggle('status', status)}
                  className="w-4 h-4"
                />
                <span className="pkd-text-mono text-sm capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <p className="pkd-text-primary text-sm font-bold mb-2">PRIORITY</p>
          <div className="space-y-2">
            {['high', 'medium', 'low'].map(priority => (
              <label key={priority} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.priority.includes(priority)}
                  onChange={() => handleToggle('priority', priority)}
                  className="w-4 h-4"
                />
                <span className="pkd-text-mono text-sm capitalize">{priority}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <hr className="pkd-divider my-4" />

      <button className="pkd-button w-full text-sm">APPLY FILTERS</button>
    </div>
  );
}
```

---

## 📝 Forms

### Multi-Step Form

```tsx
import React, { useState } from 'react';

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="pkd-card">
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 ${s <= step ? 'bg-[var(--pkd-primary)]' : 'bg-[var(--pkd-border-color)]'}`}
            />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-4">STEP 1: PERSONAL INFO</h2>
            <div className="space-y-4">
              <div>
                <label className="pkd-text-primary block mb-2 text-sm font-bold">NAME</label>
                <input
                  type="text"
                  name="name"
                  className="pkd-input w-full"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="pkd-text-primary block mb-2 text-sm font-bold">EMAIL</label>
                <input
                  type="email"
                  name="email"
                  className="pkd-input w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-4">STEP 2: MESSAGE</h2>
            <div>
              <label className="pkd-text-primary block mb-2 text-sm font-bold">YOUR MESSAGE</label>
              <textarea
                name="message"
                className="pkd-input w-full"
                rows={6}
                value={formData.message}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 className="pkd-heading pkd-heading-2 pkd-text-primary mb-4">STEP 3: REVIEW</h2>
            <div className="space-y-3">
              <div className="pkd-alert">
                <p className="pkd-text-mono text-sm"><strong>Name:</strong> {formData.name}</p>
              </div>
              <div className="pkd-alert">
                <p className="pkd-text-mono text-sm"><strong>Email:</strong> {formData.email}</p>
              </div>
              <div className="pkd-alert">
                <p className="pkd-text-mono text-sm"><strong>Message:</strong> {formData.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="pkd-button pkd-button-secondary flex-1"
            style={{ opacity: step === 1 ? 0.5 : 1 }}
          >
            PREVIOUS
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="pkd-button flex-1">
              NEXT
            </button>
          ) : (
            <button className="pkd-button flex-1">SUBMIT</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Custom Components

### Loading State

```tsx
import React from 'react';

export function LoadingState({ message = 'LOADING...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="pkd-spinner mb-4" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
      <p className="pkd-text-primary font-bold">{message}</p>
      <p className="pkd-text-mono text-xs mt-2" style={{ color: 'var(--pkd-foreground-muted)' }}>
        [ SYSTEM PROCESSING ]
      </p>
    </div>
  );
}
```

### Empty State

```tsx
import React from 'react';

export function EmptyState({
  title = 'NO DATA',
  message = 'No items to display',
  icon = '⚠️',
  action,
}: {
  title?: string;
  message?: string;
  icon?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 pkd-card">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="pkd-heading pkd-heading-3 pkd-text-primary mb-2">{title}</h3>
      <p className="pkd-text-mono text-sm mb-6" style={{ color: 'var(--pkd-foreground-muted)' }}>
        {message}
      </p>
      {action && (
        <button onClick={action.onClick} className="pkd-button">
          {action.label}
        </button>
      )}
    </div>
  );
}
```

### Error Boundary

```tsx
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--pkd-background)' }}>
          <div className="w-full max-w-md">
            <div className="pkd-card">
              <h1 className="pkd-heading pkd-heading-2 pkd-text-danger mb-4">SYSTEM ERROR</h1>
              <div className="pkd-alert pkd-alert-danger mb-6">
                <p className="pkd-text-mono text-sm">{this.state.error?.message}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="pkd-button w-full"
              >
                RESTART SYSTEM
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🎯 Best Practices

### 1. Always Use CSS Variables
```tsx
// ✅ Good
<div style={{ color: 'var(--pkd-primary)' }}>Text</div>

// ❌ Avoid
<div style={{ color: '#00ff41' }}>Text</div>
```

### 2. Combine Classes for Consistency
```tsx
// ✅ Good
<h1 className="pkd-heading pkd-heading-1 pkd-text-primary">Title</h1>

// ❌ Avoid
<h1 style={{ fontSize: '2.5rem', color: '#00ff41' }}>Title</h1>
```

### 3. Use Semantic HTML
```tsx
// ✅ Good
<button className="pkd-button">Action</button>
<input className="pkd-input" />
<nav>Navigation</nav>

// ❌ Avoid
<div onClick={...} className="pkd-button">Action</div>
<div className="pkd-input">Input</div>
```

### 4. Respect Accessibility
```tsx
// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" className="pkd-input" />

// ❌ Avoid
<input className="pkd-input" placeholder="Email" />
```

### 5. Use Grid for Layouts
```tsx
// ✅ Good
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>

// ❌ Avoid
<div style={{ display: 'flex', flexWrap: 'wrap' }}>
  {items.map(item => <div key={item.id} style={{ width: '33%' }}>{item}</div>)}
</div>
```

---

## 📚 Common Patterns

### Conditional Styling
```tsx
<div className={`pkd-card ${isActive ? 'pkd-paranoid-pulse' : ''}`}>
  Content
</div>
```

### Dynamic Classes
```tsx
const buttonClass = `pkd-button ${
  variant === 'secondary' ? 'pkd-button-secondary' : 
  variant === 'danger' ? 'pkd-button-danger' : 
  ''
}`;

<button className={buttonClass}>Action</button>
```

### Responsive Grids
```tsx
<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>
```

### Stacked Spacing
```tsx
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## 🔗 Related Documentation

- **VISUAL_STYLE_GUIDE.md** - Complete component reference
- **NEO_PKD_DESIGN_SYSTEM.md** - Technical specifications
- **PKD_DESIGN_SYSTEM_README.md** - Quick start guide
- **QUICK_START.md** - Getting started in 30 seconds

