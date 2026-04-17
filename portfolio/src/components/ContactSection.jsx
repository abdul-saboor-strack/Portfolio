import { useMemo } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

function SocialIcon({ type }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'github') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M9 19c-4 1.5-4-2.5-6-3" />
        <path d="M15 22v-3.5c0-1 .1-1.5-.5-2 2-.2 4-.9 4-4.5 0-1-.4-2-1-2.7.1-.4.4-1.5-.1-2.7 0 0-1-.3-3.1 1a10.4 10.4 0 0 0-5.4 0C6.8 2.8 5.8 3.1 5.8 3.1c-.5 1.2-.2 2.3-.1 2.7-.6.7-1 1.7-1 2.7 0 3.6 2 4.3 4 4.5-.3.3-.5.7-.5 1.4V22" />
      </svg>
    )
  }
  if (type === 'linkedin') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V9h4v2a4 4 0 0 1 2-3Z" />
        <path d="M2 9h4v12H2z" />
        <path d="M4 4a2 2 0 1 0 0.01 0Z" />
      </svg>
    )
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="M18 6L6 18" />
      <path d="M8 6h10v10" />
    </svg>
  )
}

export default function ContactSection({ contact, social }) {
  const reduced = usePrefersReducedMotion()
  const socials = useMemo(() => social ?? [], [social])

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div>
            <div className="kicker">Contact</div>
            <div className="h2">Let&apos;s build something</div>
          </div>
        </div>

        <div className="glass" style={{ padding: 18 }}>
          <div className="glass2" style={{ padding: 16, maxWidth: 480 }}>
            <div style={{ fontWeight: 900, fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif', fontSize: 16 }}>Social</div>
            <div style={{ color: 'var(--muted)', marginTop: 8, lineHeight: 1.7, fontSize: 13.5 }}>
              Find me online or email me directly.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btnSecondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 16,
                    fontWeight: 900,
                  }}
                  onClick={(e) => {
                    if (reduced) e.currentTarget.blur?.()
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'rgba(0,240,255,0.9)', display: 'inline-flex' }}>
                      <SocialIcon type={s.icon} />
                    </span>
                    {s.label}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>Open</span>
                </a>
              ))}
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>Email</div>
              <div style={{ fontWeight: 900, marginTop: 6, fontFamily: 'Inter,system-ui,sans-serif' }}>{contact?.email}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
