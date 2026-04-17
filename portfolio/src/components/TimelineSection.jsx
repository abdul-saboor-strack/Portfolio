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
                    className="responsiveGrid"
                    style={{
                      gap: 14,
                      alignItems: 'start',
                    }}
                  >
                    <div className="responsiveCol-6" style={{ justifySelf: leftSide ? 'end' : 'start' }}>
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
                      className="responsiveCol-1"
                      style={{
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

                    <div className="responsiveCol-5" />
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

