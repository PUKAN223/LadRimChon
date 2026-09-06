'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'

function subscribeOnline(notify: () => void) {
  window.addEventListener('online', notify)
  window.addEventListener('offline', notify)
  return () => { window.removeEventListener('online', notify); window.removeEventListener('offline', notify) }
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const isOffline = useSyncExternalStore(subscribeOnline, () => !navigator.onLine, () => false)
  const [updateReady, setUpdateReady] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const refreshingRef = useRef(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return
    }

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        registrationRef.current = registration
        if (registration.waiting) setUpdateReady(true)

        const notifyWhenInstalled = (worker: ServiceWorker | null) => {
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(true)
            }
          })
        }

        notifyWhenInstalled(registration.installing)
        registration.addEventListener('updatefound', () => notifyWhenInstalled(registration.installing))
      } catch (error) {
        console.warn('Service worker registration failed:', error)
      }
    }

    const handleControllerChange = () => {
      if (!refreshingRef.current) return
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    void registerWorker()
    const updateInterval = window.setInterval(() => {
      void registrationRef.current?.update().catch(() => {})
    }, 60 * 60 * 1000)

    return () => {
      window.clearInterval(updateInterval)
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  const applyUpdate = () => {
    const waitingWorker = registrationRef.current?.waiting
    if (!waitingWorker) return
    refreshingRef.current = true
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  return (
    <>
      {children}
      {isOffline && (
        <div className="connection-status" role="status">
          <WifiOff size={17} strokeWidth={2.6} />
          ไม่มีการเชื่อมต่อ กำลังใช้ข้อมูลที่บันทึกไว้
        </div>
      )}
      {updateReady && (
        <div className="pwa-update" role="status">
          <span>มีเวอร์ชันใหม่พร้อมใช้งาน</span>
          <button type="button" onClick={applyUpdate} className="pwa-update-action">
            <RefreshCw size={15} strokeWidth={2.6} />
            อัปเดต
          </button>
        </div>
      )}
    </>
  )
}
