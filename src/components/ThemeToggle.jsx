import { useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-theme'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2M19.78 4.22l-1.77 1.77M6 18l-1.78 1.78M19.78 19.78 18 18M6 6 4.22 4.22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage?.getItem(STORAGE_KEY)
      if (saved === 'light' || saved === 'dark') return saved
      const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)')?.matches
      return prefersLight ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage?.setItem(STORAGE_KEY, theme)
  }, [theme])

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="glass2"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        color: 'var(--text)',
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 99,
          background: 'var(--grad)',
          boxShadow: '0 0 18px rgba(0, 240, 255, 0.25)',
        }}
        aria-hidden="true"
      />
      <span style={{ display: 'inline-flex', color: 'var(--text)' }}>{theme === 'dark' ? <MoonIcon /> : <SunIcon />}</span>
      <span style={{ fontWeight: 800, letterSpacing: 0.2, fontSize: 13, color: 'var(--muted)' }}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}

