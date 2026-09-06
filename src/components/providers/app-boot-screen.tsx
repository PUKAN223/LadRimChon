'use client'

import { useEffect, useState } from 'react'

export function AppBootScreen({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const deadline = window.setTimeout(() => { if (!cancelled) setIsReady(true) }, 2000)
    const revealApp = () => {
      window.setTimeout(() => {
        if (!cancelled) setIsReady(true)
      }, 250)
    }

    if ('fonts' in document) {
      document.fonts.ready.then(revealApp).catch(revealApp)
    } else {
      revealApp()
    }

    return () => {
      cancelled = true
      window.clearTimeout(deadline)
    }
  }, [])

  useEffect(() => {
    const preventLinkContextMenu = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('a, img')) {
        event.preventDefault()
      }
    }

    document.addEventListener('contextmenu', preventLinkContextMenu)
    return () => document.removeEventListener('contextmenu', preventLinkContextMenu)
  }, [])

  return (
    <>
      {children}
      {!isReady && (
        <div className="app-boot-screen" role="status" aria-label="กำลังเปิดแอปหลาดริมชล">
          <div className="app-boot-content">
            <img src="/images/main-logo.png" alt="หลาดริมชล" className="app-boot-logo" />
            <div className="app-boot-progress" aria-hidden="true"><span /></div>
          </div>
        </div>
      )}
    </>
  )
}
