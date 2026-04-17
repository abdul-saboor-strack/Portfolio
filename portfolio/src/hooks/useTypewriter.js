import { useEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useTypewriter(phrases, { speed = 55, pause = 900 } = {}) {
  const reduced = usePrefersReducedMotion()
  const safePhrases = useMemo(() => (Array.isArray(phrases) && phrases.length ? phrases : ['']), [phrases])

  const [phraseIndex, setPhraseIndex] = useState(0)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (reduced) return

    let cancelled = false
    let timeoutId = null

    const fullText = safePhrases[phraseIndex] ?? ''
    const isComplete = typed === fullText

    const schedule = (fn, ms) => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return
        fn()
      }, ms)
    }

    if (!isComplete) {
      schedule(() => {
        setTyped(fullText.slice(0, typed.length + 1))
      }, speed)
    } else {
      schedule(() => {
        const next = (phraseIndex + 1) % safePhrases.length
        setPhraseIndex(next)
        setTyped('')
      }, pause)
    }

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [phraseIndex, typed, safePhrases, reduced, speed, pause])

  return reduced ? safePhrases[0] ?? '' : typed
}

