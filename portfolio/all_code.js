// Combined source code from all JS and JSX files

import { useEffect, useMemo, useState } from 'react'
import { usePortfolioData } from '../hooks/usePortfolioData'

const PASSWORD_KEY = 'portfolio-admin-password-v1'
const AUTH_SESSION_KEY = 'portfolio-admin-auth-v1'

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function parseCommaList(value) {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function AdminPage() {
  const { data: portfolioData, saveOverrides, clearOverrides } = usePortfolioData()
  const [draft, setDraft] = useState(portfolioData)

  useEffect(() => setDraft(portfolioData), [portfolioData])

  const [auth, setAuth] = useState(() => sessionStorage.getItem(AUTH_SESSION_KEY) === '1')
  const [storedPassword, setStoredPassword] = useState(() => window.localStorage.getItem(PASSWORD_KEY) || '')
  const [passInput, setPassInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const hasPassword = Boolean(storedPassword)

  const onAuthenticate = () => {
    setError('')
    if (!passInput) {
      setError('Enter a password.')
      return
    }

    if (!hasPassword) {
      window.localStorage.setItem(PASSWORD_KEY, passInput)
      setStoredPassword(passInput)
      sessionStorage.setItem(AUTH_SESSION_KEY, '1')
      setAuth(true)
      setPassInput('')
      return
    }

    if (passInput !== storedPassword) {
      setError('Incorrect password.')
      return
    }

    sessionStorage.setItem(AUTH_SESSION_KEY, '1')
    setAuth(true)
    setPassInput('')
  }

  const onLogout = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    setAuth(false)
    setError('')
    setPassInput('')
  }

  const onSave = () => {
    setError('')
    setBusy(true)
    try {
      saveOverrides(draft)
    } finally {
      window.setTimeout(() => setBusy(false), 150)
    }
  }

  const onReset = () => {
    setError('')
    clearOverrides()
    setDraft(portfolioData)
  }

  const socialById = useMemo(() => {
    const map = new Map()
    for (const s of draft.social ?? []) map.set(s.id, s)
    return map
  }, [draft.social])

  if (!auth) {
    return (
      <div style={{ minHeight: '100svh', paddingTop: 78 }}>
        <div className="container">
          <div className="glass" style={{ padding: 18 }}>
            <div className="kicker">Admin</div>
            <div className="h2" style={{ marginTop: 6 }}>
              Portfolio editor
            </div>

            <div style={{ marginTop: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
              {hasPassword ? 'Enter your admin password to edit your data and upload images.' : 'Set an admin password first. Stored locally in your browser.'}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={passInput}
                type="password"
                placeholder="Admin password"
                onChange={(e) => setPassInput(e.target.value)}
                style={{
                  flex: '1 1 260px',
                  padding: '12px 12px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text)',
                }}
              />
              <button type="button" className="btn" onClick={onAuthenticate} disabled={busy} style={{ padding: '12px 16px', borderRadius: 14, fontWeight: 900 }}>
                {hasPassword ? 'Unlock' : 'Set Password'}
              </button>
            </div>

            {error ? (
              <div style={{ marginTop: 10, color: 'rgba(255,120,120,0.95)', fontWeight: 900, fontSize: 13 }}>{error}</div>
            ) : null}

            <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.6 }}>
              Note: this is frontend-only. Images are stored in `localStorage` (data URLs).
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100svh', paddingTop: 78 }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="kicker">Admin</div>
            <div className="h2" style={{ marginTop: 6 }}>
              Edit your portfolio data
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btnSecondary" onClick={onReset} style={{ padding: '10px 14px', borderRadius: 14, fontWeight: 900 }}>
              Reset
            </button>
            <button type="button" className="btn btnSecondary" onClick={onLogout} style={{ padding: '10px 14px', borderRadius: 14, fontWeight: 900 }}>
              Log out
            </button>
          </div>
        </div>

        <div className="glass" style={{ padding: 18, marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14 }}>
            <div style={{ gridColumn: 'span 6' }}>
              <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>Name</label>
              <input
                value={draft.name ?? ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
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

            <div style={{ gridColumn: 'span 6' }}>
              <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>Headline phrases (comma-separated)</label>
              <input
                value={(draft.headlinePhrases ?? []).join(', ')}
                onChange={(e) => setDraft((prev) => ({ ...prev, headlinePhrases: parseCommaList(e.target.value) }))}
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

            <div style={{ gridColumn: 'span 12' }}>
              <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>About text</label>
              <textarea
                rows={6}
                value={draft.about?.body ?? ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, about: { ...(prev.about ?? {}), body: e.target.value } }))}
                style={{
                  width: '100%',
                  padding: '12px 12px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text)',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 12' }}>
              <div className="glass2" style={{ padding: 16 }}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Profile picture</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, alignItems: 'center' }}>
                  <div style={{ gridColumn: 'span 4' }}>
                    {draft.about?.image ? (
                      <img
                        src={draft.about.image}
                        alt="Profile preview"
                        loading="lazy"
                        style={{
                          width: '100%',
                          maxWidth: 180,
                          aspectRatio: '1 / 1',
                          objectFit: 'cover',
                          borderRadius: 999,
                          border: '1px solid rgba(255,255,255,0.12)',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div style={{ color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.6 }}>
                        No profile picture uploaded yet.
                      </div>
                    )}
                  </div>

                  <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          setBusy(true)
                          const dataUrl = await fileToDataUrl(file)
                          setDraft((prev) => ({
                            ...prev,
                            about: {
                              ...(prev.about ?? {}),
                              image: dataUrl,
                            },
                          }))
                        } catch {
                          setError('Profile image upload failed. Try a smaller image.')
                        } finally {
                          setBusy(false)
                        }
                      }}
                    />

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btnSecondary"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            about: {
                              ...(prev.about ?? {}),
                              image: '',
                            },
                          }))
                        }
                        style={{ padding: '10px 14px', borderRadius: 14, fontWeight: 900 }}
                      >
                        Remove picture
                      </button>
                    </div>

                    <div style={{ color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.6 }}>
                      Upload a square or portrait image for the About section. Saved locally in your browser.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="kicker">Projects</div>
            <div style={{ fontWeight: 900, fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif', fontSize: 18, marginTop: 6 }}>
              Edit cards + upload images
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              {(draft.projects ?? []).map((p, idx) => (
                <div key={p.id ?? idx} className="glass2" style={{ padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>
                    <div style={{ gridColumn: 'span 4' }}>
                      <div style={{ fontWeight: 900, marginBottom: 10 }}>Image</div>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt="Project preview"
                          style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)' }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.6 }}>No image yet.</div>
                      )}
                      <div style={{ marginTop: 10 }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              setBusy(true)
                              const dataUrl = await fileToDataUrl(file)
                              setDraft((prev) => {
                                const next = [...(prev.projects ?? [])]
                                next[idx] = { ...next[idx], image: dataUrl }
                                return { ...prev, projects: next }
                              })
                            } catch {
                              setError('Image upload failed. Try a smaller image.')
                            } finally {
                              setBusy(false)
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10 }}>
                        <div style={{ gridColumn: 'span 6' }}>
                          <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 6 }}>Title</label>
                          <input
                            value={p.title ?? ''}
                            onChange={(e) =>
                              setDraft((prev) => {
                                const next = [...(prev.projects ?? [])]
                                next[idx] = { ...next[idx], title: e.target.value }
                                return { ...prev, projects: next }
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 14,
                              border: '1px solid rgba(255,255,255,0.12)',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text)',
                            }}
                          />
                        </div>
                        <div style={{ gridColumn: 'span 6' }}>
                          <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 6 }}>Tags</label>
                          <input
                            value={(p.tags ?? []).join(', ')}
                            onChange={(e) =>
                              setDraft((prev) => {
                                const next = [...(prev.projects ?? [])]
                                next[idx] = { ...next[idx], tags: parseCommaList(e.target.value) }
                                return { ...prev, projects: next }
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 14,
                              border: '1px solid rgba(255,255,255,0.12)',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text)',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 6 }}>Description</label>
                        <textarea
                          rows={3}
                          value={p.description ?? ''}
                          onChange={(e) =>
                            setDraft((prev) => {
                              const next = [...(prev.projects ?? [])]
                              next[idx] = { ...next[idx], description: e.target.value }
                              return { ...prev, projects: next }
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 14,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--text)',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10 }}>
                        <div style={{ gridColumn: 'span 6' }}>
                          <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 6 }}>Live URL</label>
                          <input
                            value={p.liveUrl ?? '#'}
                            onChange={(e) =>
                              setDraft((prev) => {
                                const next = [...(prev.projects ?? [])]
                                next[idx] = { ...next[idx], liveUrl: e.target.value }
                                return { ...prev, projects: next }
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 14,
                              border: '1px solid rgba(255,255,255,0.12)',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text)',
                            }}
                          />
                        </div>
                        <div style={{ gridColumn: 'span 6' }}>
                          <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 6 }}>Repo URL</label>
                          <input
                            value={p.repoUrl ?? '#'}
                            onChange={(e) =>
                              setDraft((prev) => {
                                const next = [...(prev.projects ?? [])]
                                next[idx] = { ...next[idx], repoUrl: e.target.value }
                                return { ...prev, projects: next }
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 14,
                              border: '1px solid rgba(255,255,255,0.12)',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text)',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btnSecondary"
                          onClick={() =>
                            setDraft((prev) => {
                              const next = [...(prev.projects ?? [])].filter((_, i) => i !== idx)
                              return { ...prev, projects: next }
                            })
                          }
                          style={{ padding: '10px 14px', borderRadius: 14, fontWeight: 900 }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  projects: [
                    ...(prev.projects ?? []),
                    { id: makeId(), title: 'New Project', description: '', liveUrl: '#', repoUrl: '#', image: '', details: [], tags: ['UI'] },
                  ],
                }))
              }
              style={{ padding: '12px 16px', borderRadius: 14, fontWeight: 900, marginTop: 14 }}
              disabled={busy}
            >
              Add Project
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="kicker">Social</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12, marginTop: 14 }}>
              {['github', 'linkedin', 'twitter'].map((id) => {
                const item = socialById.get(id)
                return (
                  <div key={id} style={{ gridColumn: 'span 4' }}>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginBottom: 6 }}>{id}</label>
                    <input
                      value={item?.href ?? '#'}
                      onChange={(e) =>
                        setDraft((prev) => {
                          const next = [...(prev.social ?? [])]
                          const idx = next.findIndex((x) => x.id === id)
                          if (idx >= 0) next[idx] = { ...next[idx], href: e.target.value }
                          else next.push({ id, label: id, href: e.target.value, icon: id })
                          return { ...prev, social: next }
                        })
                      }
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
                )
              })}
            </div>
          </div>

          {error ? (
            <div style={{ marginTop: 12, color: 'rgba(255,120,120,0.95)', fontWeight: 900, fontSize: 13 }}>
              {error}
            </div>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
            <button
              type="button"
              className="btn"
              onClick={onSave}
              disabled={busy}
              style={{ padding: '12px 16px', borderRadius: 14, fontWeight: 900 }}
            >
              {busy ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { motion as Motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

function Avatar({ image, initials = 'YN' }) {
  return (
    <div
      aria-hidden="true"
      className="glass neonBorder"
      style={{
        width: 220,
        height: 220,
        borderRadius: 999,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -2,
          background: 'var(--grad)',
          opacity: 0.22,
          filter: 'blur(10px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120px circle at 20% 20%, rgba(0,240,255,0.35), transparent 60%), radial-gradient(160px circle at 80% 0%, rgba(138,43,226,0.35), transparent 55%), rgba(255,255,255,0.03)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: 165,
          height: 165,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif',
          fontWeight: 900,
          letterSpacing: -1,
          color: 'rgba(255,255,255,0.9)',
          textShadow: '0 0 30px rgba(0,240,255,0.28)',
          transform: 'translateZ(0)',
        }}
      >
        {image ? (
          <img
            src={image}
            alt="Profile portrait"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span style={{ fontSize: 58 }}>{initials}</span>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 18,
          borderRadius: 999,
          border: '1px dashed rgba(0,240,255,0.25)',
          opacity: 0.55,
        }}
      />
    </div>
  )
}

export default function AboutSection({ about }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.18, rootMargin: '0px 0px -10% 0px' })
  const aboutTitle = about?.title ?? 'About'
  const aboutBody = about?.body ?? ''
  const initials = aboutTitle
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'YN'

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div>
            <div className="kicker">About</div>
            <div className="h2">{aboutTitle}</div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              gridColumn: 'span 5',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Motion.div
              ref={ref}
              className={`reveal ${isInView ? 'in' : ''}`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{ transformOrigin: 'center', cursor: 'default' }}
            >
              <Avatar image={about?.image} initials={initials} />
            </Motion.div>
          </div>

          <Motion.div
            className={`glass ${isInView ? 'reveal in' : 'reveal'}`}
            initial={false}
            transition={{ duration: 0.6 }}
            style={{
              gridColumn: 'span 7',
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ fontWeight: 900, fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif', fontSize: 22 }}>
              I design + build interfaces that feel alive.
            </div>
            <div style={{ color: 'var(--muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{aboutBody}</div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              <div className="glass2" style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 14 }}>Focus</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  UX clarity + motion polish
                </div>
              </div>
              <div className="glass2" style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 14 }}>Passion</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Accessible, performance-first UI
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  )
}

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, alignItems: 'start' }}>
            <div style={{ gridColumn: 'span 7' }}>
              <style>{`
                .contactField:focus {
                  outline: none;
                  border-color: rgba(0,240,255,0.55) !important;
                  box-shadow: 0 0 0 3px rgba(0,240,255,0.15);
                }
              `}</style>
              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>
                  <div style={{ gridColumn: 'span 6' }}>
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
                  <div style={{ gridColumn: 'span 6' }}>
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

            <div style={{ gridColumn: 'span 5' }}>
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

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    const message = error instanceof Error ? error.message : String(error)
    return { hasError: true, message }
  }

  componentDidCatch(error, info) {
    console.error('Portfolio crashed:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="container" style={{ padding: '120px 22px 60px' }}>
        <div className="glass" style={{ padding: 18 }}>
          <div className="kicker">Runtime Error</div>
          <div className="h2" style={{ marginTop: 6 }}>
            The app failed to render.
          </div>
          <div style={{ color: 'var(--muted)', lineHeight: 1.8, marginTop: 10, whiteSpace: 'pre-wrap' }}>
            {this.state.message || 'Unknown error'}
          </div>
        </div>
      </div>
    )
  }
}

export default function Footer() {
  const onBackToTop = () => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  return (
    <footer style={{ padding: '26px 0 44px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Â© {new Date().getFullYear()} Your Name. Built with neon glass UI.
        </div>
        <button type="button" className="btn btnSecondary" onClick={onBackToTop} style={{ padding: '10px 14px', borderRadius: 14, fontWeight: 900 }}>
          Back to Top
        </button>
      </div>
    </footer>
  )
}

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

  const phrases = useMemo(() => headlinePhrases.join(' â€¢ '), [headlinePhrases])

  return (
    <section id="home" style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', padding: '34px 0' }}>
      <div className="container" style={{ position: 'relative' }}>
        <FloatingGlyph style={{ left: '4%', top: '10%' }} label="{" />
        <FloatingGlyph style={{ right: '6%', top: '18%' }} label="<> " />
        <FloatingGlyph style={{ left: '12%', bottom: '8%' }} label="âˆž" />

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

import { useEffect, useMemo, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

function rand(min, max) {
  return Math.random() * (max - min) + min
}

export default function NeonBackground() {
  const canvasRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  const config = useMemo(() => {
    const isSmall = typeof window !== 'undefined' && window.innerWidth < 768
    return {
      particleCount: reduced ? 40 : isSmall ? 60 : 95,
      speed: reduced ? 0.15 : isSmall ? 0.28 : 0.38,
      maxRadius: reduced ? 2.2 : isSmall ? 2.6 : 2.9,
    }
  }, [reduced])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
    let raf = 0

    const particles = Array.from({ length: config.particleCount }).map(() => ({
      x: rand(0, 1),
      y: rand(0, 1),
      vx: rand(-1, 1) * config.speed * 0.0007,
      vy: rand(-1, 1) * config.speed * 0.0007,
      r: rand(0.7, config.maxRadius),
      a: rand(0.18, reduced ? 0.26 : 0.36),
    }))

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Subtle vignette for depth.
      const vignette = ctx.createRadialGradient(width * 0.5, height * 0.25, 10, width * 0.5, height * 0.4, Math.max(width, height))
      vignette.addColorStop(0, 'rgba(0,240,255,0.06)')
      vignette.addColorStop(0.55, 'rgba(138,43,226,0.03)')
      vignette.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      for (const p of particles) {
        const px = p.x * width
        const py = p.y * height
        ctx.beginPath()
        ctx.fillStyle = `rgba(0, 240, 255, ${p.a})`
        ctx.arc(px, py, p.r, 0, Math.PI * 2)
        ctx.fill()

        // Secondary tint
        ctx.beginPath()
        ctx.fillStyle = `rgba(138, 43, 226, ${Math.max(0, p.a - 0.12)})`
        ctx.arc(px * 0.995 + width * 0.0025, py * 0.995 + height * 0.0025, p.r * 0.75, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const tick = () => {
      raf = window.requestAnimationFrame(tick)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -0.05) p.x = 1.05
        if (p.x > 1.05) p.x = -0.05
        if (p.y < -0.05) p.y = 1.05
        if (p.y > 1.05) p.y = -0.05
      }

      draw()
    }

    resize()
    draw()

    if (reduced) {
      // Reduced motion: render a single frame.
      return
    }

    raf = window.requestAnimationFrame(tick)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [config.particleCount, config.speed, config.maxRadius, reduced])

  return <canvas ref={canvasRef} className="neon-canvas" aria-hidden="true" />
}

import { useEffect, useState } from 'react'

export default function Preloader() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Safety net: if something prevents rendering, we never want to block the UI forever.
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const ms = prefersReduced ? 900 : 2200

    const t = window.setTimeout(() => setShow(false), ms)
    const tHard = window.setTimeout(() => setShow(false), 3000)

    const onLoaded = () => setShow(false)
    window.addEventListener('load', onLoaded, { once: true })

    // If the document is already loaded, hide immediately (async to satisfy lint).
    if (document.readyState === 'complete') {
      window.setTimeout(() => setShow(false), 0)
    }

    return () => {
      window.clearTimeout(t)
      window.clearTimeout(tHard)
    }
  }, [])

  if (!show) return null

  return (
    <div className="preloader" role="status" aria-live="polite">
      <div className="glass preloaderCard neonBorder">
        <div className="preloaderBar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  )
}

import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function ProjectModal({ project, isOpen, onClose }) {
  const closeBtnRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) closeBtnRef.current?.focus?.()
  }, [isOpen])

  const variants = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    visible: { opacity: 1, y: 0, scale: 1 },
  }

  return (
    <AnimatePresence>
      {isOpen && project ? (
        <Motion.div
          key={project.id}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? false : 'visible'}
          exit={reduced ? false : 'hidden'}
          variants={variants}
          transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'grid',
            placeItems: 'center',
            padding: 18,
          }}
        >
          <div
            aria-hidden="true"
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(10px)',
            }}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} details`}
            className="glass neonBorder"
            style={{
              width: 'min(980px, 100%)',
              position: 'relative',
              zIndex: 1,
              overflow: 'hidden',
              borderRadius: 24,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div style={{ fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif', fontWeight: 900, fontSize: 18 }}>
                  {project.title}
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="btn btnSecondary"
                  onClick={onClose}
                  style={{ padding: '10px 12px', borderRadius: 14 }}
                >
                  Close
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14 }}>
                  <div style={{ gridColumn: 'span 7', minHeight: 220 }}>
                    <img
                      src={project.image}
                      alt={`${project.title} preview`}
                      loading="lazy"
                      width="1200"
                      height="800"
                      style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 18, border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{project.description}</div>
                    {project.details?.length ? (
                      <div>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>Highlights</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', lineHeight: 1.8 }}>
                          {project.details.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                      <a
                        className="btn"
                        href={project.liveUrl}
                        target={project.liveUrl && project.liveUrl !== '#' ? '_blank' : undefined}
                        rel="noreferrer"
                        style={{ padding: '10px 12px', borderRadius: 14, fontSize: 13 }}
                      >
                        Live Demo
                      </a>
                      <a
                        className="btn btnSecondary"
                        href={project.repoUrl}
                        target={project.repoUrl && project.repoUrl !== '#' ? '_blank' : undefined}
                        rel="noreferrer"
                        style={{ padding: '10px 12px', borderRadius: 14, fontSize: 13 }}
                      >
                        GitHub Repo
                      </a>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      {project.tags?.map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'rgba(255,255,255,0.78)',
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted)', fontSize: 12.5 }}>
                Tip: Press `ESC` to close.
              </div>
            </div>
          </div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}

import { motion as Motion } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { useInView } from '../hooks/useInView'

function ProjectTiltCard({ project, onOpen }) {
  const cardRef = useRef(null)

  const onMouseEnter = () => {
    const el = cardRef.current
    if (!el) return
    const glow = el.querySelector('.projectGlow')
    if (glow) glow.style.opacity = '1'
  }

  const onMouseMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * 14
    const rotateX = (0.5 - y) * 10
    el.style.transform = `translate3d(0,-2px,0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const onMouseLeave = () => {
    const el = cardRef.current
    if (!el) return
    const glow = el.querySelector('.projectGlow')
    if (glow) glow.style.opacity = '0'
    el.style.transform = 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <Motion.div
      ref={cardRef}
      layout
      whileHover={{
        boxShadow: '0 0 0 rgba(0,240,255,0), 0 30px 90px rgba(0,0,0,0.45)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(project)
      }}
      onMouseEnter={onMouseEnter}
      style={{
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transform: 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)',
        willChange: 'transform',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -2,
          background: 'var(--grad-soft)',
          opacity: 0,
          transition: 'opacity 180ms ease',
          filter: 'blur(18px)',
        }}
        className="projectGlow"
      />

      <div style={{ padding: 14, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(10,10,15,0.55)',
          }}
        >
          <img
            src={project.image}
            alt={`${project.title} preview`}
            loading="lazy"
            width="1200"
            height="800"
            style={{ width: '100%', height: 175, objectFit: 'cover', display: 'block', opacity: 0.98 }}
          />
        </div>

        <div style={{ padding: '14px 2px 6px' }}>
          <div
            style={{
              fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif',
              fontWeight: 900,
              fontSize: 18,
              marginBottom: 6,
              letterSpacing: -0.2,
            }}
          >
            {project.title}
          </div>
          <div style={{ color: 'var(--muted)', lineHeight: 1.6, fontSize: 13.5, minHeight: 44 }}>
            {project.description}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <a
              className="btn"
              href={project.liveUrl}
              target={project.liveUrl && project.liveUrl !== '#' ? '_blank' : undefined}
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '10px 12px', borderRadius: 14, fontSize: 13 }}
            >
              Live Demo
            </a>
            <a
              className="btn btnSecondary"
              href={project.repoUrl}
              target={project.repoUrl && project.repoUrl !== '#' ? '_blank' : undefined}
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '10px 12px', borderRadius: 14, fontSize: 13 }}
            >
              GitHub Repo
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 10 }}>
          {project.tags?.slice(0, 4).map((t) => (
            <span
              key={t}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

    </Motion.div>
  )
}

export default function ProjectsSection({ projects, onOpenProject }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.14, rootMargin: '0px 0px -12% 0px' })

  const projectItems = useMemo(() => projects ?? [], [projects])

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div>
            <div className="kicker">Featured Projects</div>
            <div className="h2">Recruiter-ready case studies</div>
          </div>
        </div>

        <div ref={ref} className="glass" style={{ padding: 18 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 14,
            }}
          >
            {projectItems.map((p, i) => (
              <Motion.div
                key={p.id}
                initial={false}
                animate={isInView ? 'show' : 'hide'}
                variants={{
                  show: { opacity: 1, y: 0 },
                  hide: { opacity: 0, y: 20 },
                }}
                transition={{ duration: 0.55, delay: isInView ? i * 0.06 : 0 }}
                style={{ gridColumn: 'span 6' }}
              >
                <ProjectTiltCard project={p} onOpen={onOpenProject} />
              </Motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { motion as Motion } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { useInView } from '../hooks/useInView'

function SkillRing({ level }) {
  const pct = Math.max(0, Math.min(100, level))
  const ringStyle = {
    background: `conic-gradient(from 180deg, rgba(0,240,255,0.95) ${pct}%, rgba(255,255,255,0.08) ${pct}% 100%)`,
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: 70,
        height: 70,
        borderRadius: 999,
        padding: 6,
        position: 'relative',
        ...ringStyle,
        transition: 'transform 220ms ease, filter 220ms ease',
        filter: 'drop-shadow(0 0 18px rgba(0,240,255,0.18))',
      }}
    >
      <div
        style={{
          inset: 6,
          position: 'absolute',
          borderRadius: 999,
          background: 'rgba(10,10,15,0.35)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 900,
          fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif',
          color: 'rgba(255,255,255,0.92)',
        }}
      >
        <span style={{ fontSize: 15 }}>{pct}</span>
      </div>
    </div>
  )
}

export default function SkillsSection({ skills }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.12, rootMargin: '0px 0px -10% 0px' })

  const skillItems = useMemo(() => skills ?? [], [skills])

  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div>
            <div className="kicker">Skills</div>
            <div className="h2">Tools I use to ship</div>
          </div>
        </div>

        <div
          ref={ref}
          className={`glass ${isInView ? 'reveal in' : 'reveal'}`}
          style={{ padding: 18 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 14,
            }}
          >
            {skillItems.map((s) => {
              const level = Math.max(0, Math.min(100, Number(s.level) || 0))
              const code = String(s.code || s.name || '').slice(0, 6).toUpperCase()

              return (
                <Motion.div
                  key={s.name}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    gridColumn: 'span 6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    padding: 14,
                    borderRadius: 18,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: -2,
                      background: 'var(--grad-soft)',
                      opacity: 0,
                      transition: 'opacity 220ms ease',
                      filter: 'blur(16px)',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 900,
                        letterSpacing: 0.8,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 0 26px rgba(0,240,255,0.08)',
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12 }}>{code}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif', fontSize: 15 }}>
                        {s.name}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                        {level >= 90 ? 'Expert' : level >= 80 ? 'Advanced' : level >= 70 ? 'Strong' : 'Working'}
                      </div>
                    </div>
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <SkillRing level={level} />
                  </div>
                </Motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

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

import { motion as Motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function TimelineSection({ timeline }) {
  const containerRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const items = useMemo(() => timeline ?? [], [timeline])

  const [visibleIds, setVisibleIds] = useState(() => new Set())

  useEffect(() => {
    const root = containerRef.current
    if (!root || !items.length) return

    if (reduced) return

    const els = Array.from(root.querySelectorAll('[data-timeline-item]'))
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisible = []
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id')
            if (id) newlyVisible.push(id)
          }
        }
        if (!newlyVisible.length) return
        setVisibleIds((prev) => {
          const next = new Set(prev)
          for (const id of newlyVisible) next.add(id)
          return next
        })
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items, reduced])

  const visibleCount = visibleIds.size
  const progress = items.length ? (reduced ? 1 : visibleCount / items.length) : 0

  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div>
            <div className="kicker">Experience</div>
            <div className="h2">My timeline</div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="glass"
          style={{ padding: 18, position: 'relative', overflow: 'hidden' }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: 34,
              bottom: 34,
              width: 2,
              transform: `translateX(-1px) scaleY(${progress})`,
              transformOrigin: 'top',
              background: 'var(--grad)',
              opacity: 0.8,
              boxShadow: '0 0 18px rgba(0,240,255,0.18)',
              transition: 'transform 450ms ease',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item, i) => {
                const leftSide = i % 2 === 0
                const isVisible = visibleIds.has(item.id) || reduced

                return (
                  <Motion.div
                    key={item.id}
                    data-timeline-item
                    data-id={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    transition={{ duration: 0.5, delay: isVisible ? i * 0.04 : 0 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(12, 1fr)',
                      gap: 14,
                      alignItems: 'start',
                    }}
                  >
                    <div style={{ gridColumn: leftSide ? 'span 6' : 'span 6', justifySelf: leftSide ? 'end' : 'start' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          alignItems: leftSide ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{ color: 'rgba(0,240,255,0.85)', fontWeight: 900, letterSpacing: 0.2, fontSize: 12 }}>
                          {item.date}
                        </div>
                        <div className="glass2" style={{ padding: 16, maxWidth: 480 }}>
                          <div style={{ fontFamily: 'Poppins,Orbitron,Inter,system-ui,sans-serif', fontWeight: 900, fontSize: 16 }}>
                            {item.role}
                          </div>
                          <div style={{ color: 'var(--muted)', marginTop: 8, lineHeight: 1.7, fontSize: 13.5 }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      aria-hidden="true"
                      style={{
                        gridColumn: 'span 1',
                        display: 'grid',
                        placeItems: 'center',
                        paddingTop: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 99,
                          background: isVisible ? 'var(--accent)' : 'rgba(255,255,255,0.18)',
                          boxShadow: isVisible ? '0 0 22px rgba(0,240,255,0.45)' : 'none',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: leftSide ? 'span 5' : 'span 5' }} />
                  </Motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

  export const siteData = {
    name: 'Abdul Saboor',
  
    headlinePhrases: [
      'Frontend Developer',
      'React Developer',
      'Computer Systems Engineer'
    ],
  
    about: {
      title: 'Who I am',
      image: '',
      body: `I am Abdul Saboor, a Computer Systems Engineering student at Sukkur IBA University (4th Semester).
  I specialize in building modern, responsive web applications using React, JavaScript, and Node.js.
  
  I enjoy solving real-world problems through code and have experience developing projects like e-commerce platforms and management systems.`,
    },
  
    skills: [
      { name: 'HTML5', level: 90, code: 'HTML' },
      { name: 'CSS3', level: 88, code: 'CSS' },
      { name: 'JavaScript', level: 85, code: 'JS' },
      { name: 'React', level: 82, code: 'RE' },
      { name: 'Node.js', level: 80, code: 'ND' },
      { name: 'TypeScript', level: 75, code: 'TS' },
      { name: 'Java', level: 78, code: 'JV' },
    ],
  
    projects: [
      {
        id: 'ecommerce',
        title: 'E-commerce Website',
        description: 'A full-featured e-commerce web application with product listings and user interaction.',
        image: '/images/portfolio-pic.jpeg',
        liveUrl: '#', // yahan apni deployed link daalna
        repoUrl: '#', // yahan GitHub link daalna
        details: [
          'Built using React and modern JavaScript',
          'Responsive design for mobile and desktop',
          'Product browsing and UI interactions',
        ],
        tags: ['React', 'Frontend'],
      },
      {
        id: 'hospital-system',
        title: 'Hospital Management System',
        description: 'A DSA-based system for managing hospital operations and records.',
        image: '/images/hospital.png',
        liveUrl: '#',
        repoUrl: '#',
        details: [
          'Implemented using Java',
          'Used Data Structures for efficient data handling',
          'Manages patient and hospital records',
        ],
        tags: ['Java', 'DSA'],
      },
    ],
  
    timeline: [
      {
        id: 't1',
        date: '2026',
        role: 'CSE Student (4th Semester)',
        description: 'Currently studying Computer Systems Engineering at Sukkur IBA University.',
      },
      {
        id: 't2',
        date: '2025',
        role: 'Frontend Development',
        description: 'Worked on React, JavaScript, and built real-world projects like e-commerce applications.',
      },
      {
        id: 't3',
        date: '2024',
        role: 'Programming Foundation',
        description: 'Learned Java and Data Structures and built a hospital management system project.',
      },
    ],
  
    contact: {
      email: 'abdulsaboorabbasi.becsef24@iba-suk.edu.pk', // apna email yahan daalo
    },
  
    social: [
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/yourusername',
        icon: 'github',
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/yourprofile',
        icon: 'linkedin',
      },
    ],
  };
import { useEffect, useState } from 'react'

export function useInView(ref, { once = true, threshold = 0.2, rootMargin = '0px' } = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref?.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, once, threshold, rootMargin])

  return inView
}

import { useEffect, useMemo, useState } from 'react'
import { siteData } from '../content/siteData'

const STORAGE_KEY = 'portfolio-admin-data-v1'
const UPDATE_EVENT = 'portfolio-data-updated-v1'

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function mergeData(defaultData, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaultData

  return {
    ...defaultData,
    ...overrides,
    about: { ...(defaultData.about ?? {}), ...(overrides.about ?? {}) },
    contact: { ...(defaultData.contact ?? {}), ...(overrides.contact ?? {}) },
    skills: Array.isArray(overrides.skills) ? overrides.skills : defaultData.skills,
    projects: Array.isArray(overrides.projects) ? overrides.projects : defaultData.projects,
    timeline: Array.isArray(overrides.timeline) ? overrides.timeline : defaultData.timeline,
    social: Array.isArray(overrides.social) ? overrides.social : defaultData.social,
    headlinePhrases: Array.isArray(overrides.headlinePhrases) ? overrides.headlinePhrases : defaultData.headlinePhrases,
  }
}

export function usePortfolioData() {
  const defaultData = useMemo(() => siteData, [])
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    const load = () => {
      const raw = window.localStorage?.getItem(STORAGE_KEY)
      if (!raw) {
        setData(defaultData)
        return
      }
      const parsed = safeParse(raw)
      setData(mergeData(defaultData, parsed))
    }

    load()

    const onUpdated = () => load()
    window.addEventListener(UPDATE_EVENT, onUpdated)
    return () => window.removeEventListener(UPDATE_EVENT, onUpdated)
  }, [defaultData])

  const saveOverrides = (overrides) => {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(overrides))
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }

  const clearOverrides = () => {
    window.localStorage?.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }

  return { data, saveOverrides, clearOverrides, STORAGE_KEY }
}

import { useEffect, useState } from 'react'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return

    const update = () => setReduced(Boolean(mq.matches))
    update()

    // Safari < 14 uses addListener/removeListener.
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }

    mq.addListener(update)
    return () => mq.removeListener(update)
  }, [])

  return reduced
}

import { useEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useTypewriter(phrases, { speed = 55, pause = 900 } = {}) {
  const reduced = usePrefersReducedMotion()
  const safePhrases = useMemo(() => (Array.isArray(phrases) && phrases.length ? phrases : ['']), [phrases])

  const [phraseIndex, setPhraseIndex] = useState(0)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (reduced) return

    let cancelled = false
    let timeoutId = null

    const fullText = safePhrases[phraseIndex] ?? ''
    const isComplete = typed === fullText

    const schedule = (fn, ms) => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return
        fn()
      }, ms)
    }

    if (!isComplete) {
      schedule(() => {
        setTyped(fullText.slice(0, typed.length + 1))
      }, speed)
    } else {
      schedule(() => {
        const next = (phraseIndex + 1) % safePhrases.length
        setPhraseIndex(next)
        setTyped('')
      }, pause)
    }

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [phraseIndex, typed, safePhrases, reduced, speed, pause])

  return reduced ? safePhrases[0] ?? '' : typed
}

import { useEffect, useMemo, useState } from 'react'
import AboutSection from './components/AboutSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import NeonBackground from './components/NeonBackground'
import Preloader from './components/Preloader'
import ProjectsSection from './components/ProjectsSection'
import ProjectModal from './components/ProjectModal'
import SkillsSection from './components/SkillsSection'
import ErrorBoundary from './components/ErrorBoundary'
import ThemeToggle from './components/ThemeToggle'
import TimelineSection from './components/TimelineSection'
import AdminPage from './admin/AdminPage'
import { usePortfolioData } from './hooks/usePortfolioData'

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null)

  const isAdmin =
    window.location.pathname === '/admin' || window.location.pathname === '/admin/' || window.location.hash === '#/admin'

  const { data } = usePortfolioData()
  const { name, headlinePhrases, about, skills, projects, timeline, contact, social } = data

  const modalOpen = Boolean(selectedProject)

  useEffect(() => {
    if (isAdmin) return
    document.title = `${name} | Portfolio`
  }, [name, isAdmin])

  const navItems = useMemo(
    () => [
      { id: 'about', label: 'About' },
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'experience', label: 'Experience' },
      { id: 'contact', label: 'Contact' },
    ],
    []
  )

  if (isAdmin) {
    return <AdminPage />
  }

  return (
    <div>
      <Preloader />
      <NeonBackground />

      <header
        style={{
          position: 'fixed',
          top: 14,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div className="container" style={{ pointerEvents: 'auto' }}>
          <div
            className="glass2"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: 'var(--grad)',
                  boxShadow: '0 0 18px rgba(0,240,255,0.25)',
                }}
              />
              <button
                type="button"
                className="btn btnSecondary"
                onClick={() => scrollToId('home')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 14,
                  fontWeight: 900,
                  letterSpacing: 0.2,
                }}
              >
                {name}
              </button>
            </div>

            <nav style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="btn btnSecondary"
                  onClick={() => scrollToId(item.id)}
                  style={{ padding: '8px 10px', borderRadius: 14, fontWeight: 900, fontSize: 13 }}
                >
                  {item.label}
                </button>
              ))}

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <main style={{ paddingTop: 92 }}>
          <HeroSection name={name} headlinePhrases={headlinePhrases} onViewWork={() => scrollToId('projects')} />
          <AboutSection about={about} />
          <SkillsSection skills={skills} />
          <ProjectsSection projects={projects} onOpenProject={setSelectedProject} />
          <TimelineSection timeline={timeline} />
          <ContactSection contact={contact} social={social} />
          <Footer />
        </main>
      </ErrorBoundary>

      <ProjectModal project={selectedProject} isOpen={modalOpen} onClose={() => setSelectedProject(null)} />
    </div>
  )
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
