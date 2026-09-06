'use client'

import Link from 'next/link'
import { ChevronLeft, ShoppingBag, Store } from 'lucide-react'
import { useAppSelector } from '@/lib/hooks'
import { selectCartCount } from '@/store/slices/cart.slice'

interface MarketHeaderProps {
  title?: string
  showBack?: boolean
  backHref?: string
  showCart?: boolean
  transparent?: boolean
}

export function MarketHeader({
  title,
  showBack = false,
  backHref = '/',
  showCart = true,
  transparent = false,
}: MarketHeaderProps) {
  const cartCount = useAppSelector(selectCartCount)

  return (
    <header
      className={`sticky top-0 z-50 grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2 items-center px-4 h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${transparent
          ? 'bg-transparent'
          : 'bg-[#F7F3E8]/95 backdrop-blur-md border-b border-[#E9D7B5]/60'
        }`}
    >
      {/* Left */}
      <div className="flex items-center gap-2.5 min-w-[40px]">
        {showBack ? (
          <Link
            href={backHref}
            aria-label="ย้อนกลับ"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70 shadow-xs hover:bg-[#FAF7F0] active:scale-95 transition-all text-[#2E2318]"
          >
            <ChevronLeft size={22} strokeWidth={2.8} />
          </Link>
        ) : (
          <Link href="/" aria-label="หน้าหลัก" className="flex items-center justify-center w-11 h-11 group">
            <div className="w-8 h-8 rounded-full bg-white border border-[#E9D7B5]/70 shadow-xs flex items-center justify-center text-market-brown">
              <Store size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
            </div>
          </Link>
        )}
      </div>

      {/* Center title */}
      {title ? (
        <h1 className="font-bold text-[#2E2318] text-[16px] truncate text-center">
          {title}
        </h1>
      ) : <span />}

      {/* Right */}
      <div className="flex items-center gap-2 min-w-[40px] justify-end">
        {showCart && (
          <Link
            href="/cart"
            aria-label={`ตะกร้า ${cartCount} รายการ`}
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70 shadow-xs hover:bg-[#FAF7F0] active:scale-95 transition-all text-[#2E2318]"
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-market-orange text-white text-[9px] font-bold shadow-xs px-1">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  )
}
