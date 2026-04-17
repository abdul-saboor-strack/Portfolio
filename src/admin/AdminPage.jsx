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

