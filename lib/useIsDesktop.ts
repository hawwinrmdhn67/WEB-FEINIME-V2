// hooks/useIsDesktop.ts
import { useEffect, useState } from 'react'

export default function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(min-width: ${breakpoint}px)`).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler)
    } else if (typeof (mq as any).addListener === 'function') {
      ;(mq as any).addListener(handler)
    }

    // sync initial
    setIsDesktop(mq.matches)

    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handler)
      } else if (typeof (mq as any).removeListener === 'function') {
        ;(mq as any).removeListener(handler)
      }
    }
  }, [breakpoint])

  return isDesktop
}
