import { useMemo, useState } from 'react'
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
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)

  const socials = useMemo(() => social ?? [], [social])

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.'
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Please enter a valid email.'
    if (form.message.trim().length < 10) return 'Please write a short message (10+ characters).'
    return null
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setStatus({ ok: false, text: err })
      return
    }

    setStatus({ ok: true, text: 'Message prepared. (Demo form: no backend connected.)' })
    setForm({ name: '', email: '', message: '' })
  }

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
          <div className="responsiveGrid" style={{ alignItems: 'start' }}>
            <div className="responsiveCol-7">
              <style>{`
                .contactField:focus {
                  outline: none;
                  border-color: rgba(0,240,255,0.55) !important;
                  box-shadow: 0 0 0 3px rgba(0,240,255,0.15);
                }
              `}</style>
              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="responsiveGrid">
                  <div className="responsiveCol-6">
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>Name</label>
                    <input
                      className="contactField"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="Your name"
                      style={{
                        width: '100%',
                        padding: '12px 12px',
                        borderRadius: 14,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                  <div className="responsiveCol-6">
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>Email</label>
                    <input
                      className="contactField"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="you@domain.com"
                      style={{
                        width: '100%',
                        padding: '12px 12px',
                        borderRadius: 14,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>Message</label>
                  <textarea
                    className="contactField"
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    placeholder="Tell me about your project..."
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '12px 12px',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text)',
                      resize: 'vertical',
                      minHeight: 140,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 14,
                      transition: reduced ? 'none' : undefined,
                    }}
                  >
                    Send Message
                  </button>
                  <div
                    aria-live="polite"
                    style={{
                      color: status?.ok ? 'rgba(0,240,255,0.95)' : 'rgba(255,120,120,0.95)',
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {status ? status.text : ' '}
                  </div>
                </div>
              </form>
            </div>

            <div className="responsiveCol-5">
              <div className="glass2" style={{ padding: 16 }}>
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
                        // Keep interaction responsive even with reduced-motion settings.
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
        </div>
      </div>
    </section>
  )
}

