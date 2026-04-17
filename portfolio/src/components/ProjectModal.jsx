import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

function ImageCarousel({ images, title }) {
  const [active, setActive] = useState(0)
  const reduced = usePrefersReducedMotion()

  // Reset to first slide when project changes
  useEffect(() => setActive(0), [images])

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length)
  const next = () => setActive((a) => (a + 1) % images.length)

  if (!images || images.length === 0) return null

  return (
    <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', contain: 'layout' }}>
      {/* Slides */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'rgba(10,10,15,0.55)', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" initial={false}>
          <Motion.img
            key={active}
            src={images[active]}
            alt={`${title} screenshot ${active + 1}`}
            loading="lazy"
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? false : { opacity: 1 }}
            exit={reduced ? false : { opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </AnimatePresence>

        {/* Counter badge */}
        {images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.15)',
              letterSpacing: 0.4,
            }}
          >
            {active + 1} / {images.length}
          </div>
        )}

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: 999,
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 16,
                transition: reduced ? 'none' : 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,240,255,0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)' }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: 999,
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 16,
                transition: reduced ? 'none' : 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,240,255,0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)' }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dot navigation */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 0 8px',
            background: 'rgba(10,10,15,0.55)',
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? 20 : 7,
                height: 7,
                borderRadius: 999,
                background: i === active ? 'rgba(0,240,255,0.9)' : 'rgba(255,255,255,0.28)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: reduced ? 'none' : 'width 200ms ease, background 200ms ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

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

  // Support both single `image` string and `images` array
  const resolveImages = (p) => {
    if (!p) return []
    if (Array.isArray(p.images) && p.images.length > 0) return p.images
    if (p.image) return [p.image]
    return []
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
              maxHeight: 'calc(100svh - 36px)',
              overflowY: 'auto',
              position: 'relative',
              zIndex: 1,
              borderRadius: 24,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Header */}
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

              {/* Body */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14 }}>
                  {/* Image carousel */}
                  <div style={{ gridColumn: 'span 7', minHeight: 180 }}>
                    <ImageCarousel images={resolveImages(project)} title={project.title} />
                  </div>

                  {/* Info panel */}
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
