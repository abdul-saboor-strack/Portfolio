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

  const [auth, setAuth] = useState(() => Boolean(sessionStorage.getItem(AUTH_SESSION_KEY)))
  const [passInput, setPassInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onAuthenticate = async () => {
    setError('')
    if (!passInput) {
      setError('Enter a password.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passInput })
      })
      const body = await res.json()

      if (!res.ok) {
        setError(body.error || 'Authentication failed.')
        return
      }

      sessionStorage.setItem(AUTH_SESSION_KEY, passInput)
      setAuth(true)
      setPassInput('')
    } catch (e) {
      setError('Failed to reach authentication server.')
    } finally {
      setBusy(false)
    }
  }

  const onLogout = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    setAuth(false)
    setError('')
    setPassInput('')
  }

  const onSave = async () => {
    setError('')
    setBusy(true)
    try {
      saveOverrides(draft) // Update preview locally
      const storedPass = sessionStorage.getItem(AUTH_SESSION_KEY)
      
      const res = await fetch('/api/publish', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: storedPass, data: draft }) 
      })
      const body = await res.json()

      if (!res.ok) {
        setError(body.error || 'Failed to save to server.')
        return
      }

      alert('Successfully published to GitHub! Changes will be live in 1-2 minutes automatically.')
    } catch (e) {
      setError('Failed to reach publishing server.')
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
              Enter your live admin password to securely edit your data and publish to GitHub.
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
                {busy ? 'Verifying...' : 'Unlock Server'}
              </button>
            </div>

            {error ? (
              <div style={{ marginTop: 10, color: 'rgba(255,120,120,0.95)', fontWeight: 900, fontSize: 13 }}>{error}</div>
            ) : null}

            <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.6 }}>
              Note: This dashboard requires the ADMIN_PASSWORD environment variable to be configured on your server deployment.
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
                      <div style={{ fontWeight: 900, marginBottom: 10 }}>Images</div>

                      {/* Thumbnail strip */}
                      {(() => {
                        const imgs = p.images?.length ? p.images : p.image ? [p.image] : []
                        return imgs.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {imgs.map((src, imgIdx) => (
                              <div key={imgIdx} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
                                <img
                                  src={src}
                                  alt={`Project image ${imgIdx + 1}`}
                                  loading="lazy"
                                  style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                                />
                                {imgIdx === 0 && (
                                  <div style={{
                                    position: 'absolute', top: 6, left: 6,
                                    background: 'rgba(0,240,255,0.85)', color: '#000',
                                    fontSize: 10, fontWeight: 900, padding: '2px 8px',
                                    borderRadius: 999, letterSpacing: 0.3,
                                  }}>THUMBNAIL</div>
                                )}
                                <button
                                  type="button"
                                  aria-label={`Remove image ${imgIdx + 1}`}
                                  onClick={() =>
                                    setDraft((prev) => {
                                      const next = [...(prev.projects ?? [])]
                                      const updatedImgs = (next[idx].images ?? [next[idx].image]).filter((_, ii) => ii !== imgIdx)
                                      next[idx] = {
                                        ...next[idx],
                                        images: updatedImgs,
                                        image: updatedImgs[0] ?? '',
                                      }
                                      return { ...prev, projects: next }
                                    })
                                  }
                                  style={{
                                    position: 'absolute', top: 6, right: 6,
                                    background: 'rgba(255,60,60,0.85)', color: '#fff',
                                    border: 'none', borderRadius: 999,
                                    width: 24, height: 24, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 900, lineHeight: 1,
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.6, marginBottom: 6 }}>No images yet.</div>
                        )
                      })()}

                      {/* Add images picker */}
                      <div style={{ marginTop: 10 }}>
                        <label style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>
                          Add image(s) — first image used as card thumbnail
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files ?? [])
                            if (!files.length) return
                            try {
                              setBusy(true)
                              const dataUrls = await Promise.all(files.map(fileToDataUrl))
                              setDraft((prev) => {
                                const next = [...(prev.projects ?? [])]
                                const existing = next[idx].images?.length
                                  ? next[idx].images
                                  : next[idx].image
                                  ? [next[idx].image]
                                  : []
                                const merged = [...existing, ...dataUrls]
                                next[idx] = {
                                  ...next[idx],
                                  images: merged,
                                  image: merged[0] ?? '',
                                }
                                return { ...prev, projects: next }
                              })
                              e.target.value = ''
                            } catch {
                              setError('Image upload failed. Try smaller images.')
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
                    { id: makeId(), title: 'New Project', description: '', liveUrl: '#', repoUrl: '#', image: '', images: [], details: [], tags: ['UI'] },
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
              style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 900 }}
            >
              {busy ? 'Publishing Commit...' : 'Publish to GitHub'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

