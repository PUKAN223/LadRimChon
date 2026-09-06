'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBasket } from 'lucide-react'
import { useAppSelector } from '@/lib/hooks'
import { selectCartCount } from '@/store/slices/cart.slice'

export function FloatingCart() {
  const pathname = usePathname()
  const cartCount = useAppSelector(selectCartCount)

  // Don't show on Cart page itself or on dish customization/menu detail page
  if (cartCount === 0 || pathname === '/cart' || pathname.startsWith('/menu/') || pathname.startsWith('/orders/') || pathname.startsWith('/pickup/')) {
    return null
  }

  // Determine bottom offset: above bottom bar if on home/orders/profile/shops, or bottom of screen
  const hasBottomNav =
    pathname === '/' ||
    pathname === '/orders' ||
    pathname === '/profile' ||
    pathname === '/shops' ||
    pathname.startsWith('/shops/')

  const bottomClass = hasBottomNav
    ? 'bottom-[calc(96px+env(safe-area-inset-bottom,0px))]'
    : 'bottom-[max(2rem,env(safe-area-inset-bottom,0px))]'

  return (
    <div
      className={`fixed ${bottomClass} left-1/2 translate-y-[7px] -translate-x-1/2 w-full max-w-[430px] px-5 pointer-events-none flex justify-end z-40 transition-all duration-300`}
    >
      <Link
        href="/cart"
        id="floating-cart-button"
        className="pointer-events-auto relative flex items-center justify-center w-15 h-15 rounded-[20px] bg-market-dark text-white shadow-[0_10px_24px_rgba(46,35,24,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(46,35,24,0.32)] active:scale-95 active:translate-y-0 transition-all duration-200 border border-white/70 group animate-bounce-in"
        aria-label={`ตะกร้าสินค้า ${cartCount} รายการ`}
      >
        <span aria-hidden="true" className="absolute inset-1 rounded-[15px] border border-white/15" />
        <ShoppingBasket size={25} strokeWidth={2.35} className="relative z-10 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1.5 -right-1.5 z-10 min-w-[23px] h-[23px] rounded-full bg-market-orange text-market-dark text-[11px] font-black flex items-center justify-center px-1 border-2 border-market-cream shadow-xs">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      </Link>
    </div>
  )
}
