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

