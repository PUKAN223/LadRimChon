'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const directionRef = useRef<'forward' | 'back'>('forward')

  useEffect(() => {
    const rememberLinkDirection = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (target?.closest('[data-navigation-direction="back"]')) {
        directionRef.current = 'back'
      } else if (target?.closest('a[href]')) {
        directionRef.current = 'forward'
      }
    }
    const rememberBrowserBack = () => { directionRef.current = 'back' }

    document.addEventListener('click', rememberLinkDirection, true)
    window.addEventListener('popstate', rememberBrowserBack)
    return () => {
      document.removeEventListener('click', rememberLinkDirection, true)
      window.removeEventListener('popstate', rememberBrowserBack)
    }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => { directionRef.current = 'forward' })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return <div key={pathname} className={directionRef.current === 'back' ? 'animate-page-enter-back' : 'animate-page-enter'}>{children}</div>
}
