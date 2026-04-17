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

