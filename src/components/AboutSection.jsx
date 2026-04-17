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

