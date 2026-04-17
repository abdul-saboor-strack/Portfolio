import { useEffect, useState } from 'react'

export function useInView(ref, { once = true, threshold = 0.2, rootMargin = '0px' } = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref?.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, once, threshold, rootMargin])

  return inView
}

