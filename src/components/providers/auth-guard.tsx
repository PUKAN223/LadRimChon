'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isHydrated } = useAppSelector((state) => state.session)

  useEffect(() => {
    if (isHydrated && !user) router.replace(`/auth?next=${encodeURIComponent(pathname)}`)
  }, [isHydrated, pathname, router, user])

  if (!isHydrated || !user) return <div className="min-h-screen bg-market-cream" />
  return <>{children}</>
}
