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

