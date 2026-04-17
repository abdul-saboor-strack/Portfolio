import { motion as Motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'

function FloatingGlyph({ style, label }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        ...style,
        width: 46,
        height: 46,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 35px rgba(0,240,255,0.14)',
        display: 'grid',
        placeItems: 'center',
        color: 'rgba(255,255,255,0.78)',
        fontWeight: 800,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </div>
  )
}

export default function HeroSection({ name, headlinePhrases, onViewWork }) {
  const typed = useTypewriter(headlinePhrases, { speed: 50, pause: 900 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40)
    return () => window.clearTimeout(t)
  }, [])

  const phrases = useMemo(() => headlinePhrases.join(' • '), [headlinePhrases])

  return (
    <section id="home" style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', padding: '34px 0' }}>
      <div className="container" style={{ position: 'relative' }}>
        <FloatingGlyph style={{ left: '4%', top: '10%' }} label="{" />
        <FloatingGlyph style={{ right: '6%', top: '18%' }} label="<> " />
        <FloatingGlyph style={{ left: '12%', bottom: '8%' }} label="∞" />

        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 18 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="glass neonBorder" style={{ padding: '26px 22px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
              <div className="kicker">Futuristic Frontend</div>
              <h1 className="displayName">
                {name}
              </h1>

              <div className="typingLine" aria-label={phrases}>
                <span style={{ color: 'var(--text)', fontWeight: 800 }}>{typed}</span>
                <span className="cursorBlink" aria-hidden="true" />
              </div>

              <p className="muted" style={{ margin: 0, maxWidth: 720, lineHeight: 1.7 }}>
                I build smooth, recruiter-friendly interfaces with neon glass UI, scroll-driven microinteractions, and performance-first patterns.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                <button type="button" className="btn" onClick={onViewWork}>
                  View My Work
                </button>
                <a
                  className="btn btnSecondary"
                  href="#contact"
                  onClick={(e) => {
                    // Smooth scroll with reduced-motion fallback.
                    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
                    e.preventDefault()
                    const el = document.getElementById('contact')
                    if (!el) return
                    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Contact Me
                </a>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
    </section>
  )
}

