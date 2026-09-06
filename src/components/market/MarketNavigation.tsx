'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'หน้าหลัก', icon: Home },
  { href: '/orders', label: 'ออเดอร์', icon: ClipboardList },
  { href: '/profile', label: 'โปรไฟล์', icon: User },
]

export function MarketNavigation() {
  const pathname = usePathname()

  // Hide bottom tab bar on cart, customization / menu detail, and pickup screen
  if (
    pathname.startsWith('/menu/') ||
    pathname === '/cart' ||
    pathname.includes('/pickup')
  ) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40">
      <div className="bg-white/95 backdrop-blur-md border-t border-[#E9D7B5]/60 shadow-[0_-4px_16px_rgba(46,35,24,0.05)]">
        <div className="flex items-center justify-around px-4 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-12 flex-col items-center justify-center flex-1 py-1 gap-1 rounded-2xl active:scale-95 transition-[transform,background-color] duration-200 ${
                  isActive ? 'bg-[#F7F3E8]/90' : 'hover:bg-[#FAF7F0]'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.8 : 2.2}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-market-brown fill-market-brown/15' : 'text-[#4A382A]'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] leading-tight transition-colors duration-200 ${
                    isActive ? 'text-market-brown font-extrabold' : 'text-[#4A382A] font-bold'
                  }`}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
