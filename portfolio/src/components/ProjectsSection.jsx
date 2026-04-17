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

