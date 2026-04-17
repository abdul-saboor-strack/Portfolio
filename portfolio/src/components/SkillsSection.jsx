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

