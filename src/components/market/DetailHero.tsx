'use client'

import Link from 'next/link'
import { ChevronLeft, ShoppingBag } from 'lucide-react'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { useAppSelector } from '@/lib/hooks'
import { selectCartCount } from '@/store/slices/cart.slice'

export function DetailHero({ src, alt, backHref, closed = false }: {
  src: string; alt: string; backHref: string; closed?: boolean
}) {
  const count = useAppSelector(selectCartCount)
  return (
    <>
      {/* Sticky solid status bar backdrop to prevent iOS blur over the photo and protect the notch area */}
      <div className="sticky top-0 z-30 w-full h-[env(safe-area-inset-top,0px)] bg-[#F7F3E8]" />

      <div className="detail-hero">
        <ImageWithSkeleton src={src} alt={alt} wrapperClassName="absolute inset-0" className="object-cover" fallbackSrc="/images/food/default.jpg" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/25 to-transparent" />
        {closed && <span className="absolute bottom-9 left-5 z-10 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-market-dark">ปิดให้บริการ</span>}
        <nav aria-label="การนำทาง" className="detail-hero-actions">
          <Link href={backHref} aria-label="ย้อนกลับ" data-navigation-direction="back" className="detail-float-button"><ChevronLeft size={22} strokeWidth={2} /></Link>
          <Link href="/cart" aria-label={`ตะกร้า ${count} รายการ`} className="detail-float-button relative">
            <ShoppingBag size={20} strokeWidth={2} />
            {count > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-market-orange px-1 text-center text-[10px] font-bold leading-5 text-market-dark">{count > 99 ? '99+' : count}</span>}
          </Link>
        </nav>
      </div>
    </>
  )
}
