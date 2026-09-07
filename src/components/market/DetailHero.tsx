'use client'

import Link from 'next/link'
import { ChevronLeft, ShoppingBag } from 'lucide-react'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { useAppSelector } from '@/lib/hooks'
import { selectCartCount } from '@/store/slices/cart.slice'

export function DetailHero({
  src,
  alt,
  backHref,
  closed = false,
  title,
  favoriteType,
  favoriteId,
}: {
  src: string
  alt: string
  backHref: string
  closed?: boolean
  title?: string
  favoriteType?: 'shop' | 'product'
  favoriteId?: string
}) {
  const count = useAppSelector(selectCartCount)

  return (
    <div className="relative">
      {/* Sticky solid header bar: 100% solid cream to eliminate iOS status bar blur and keep buttons accessible */}
      <header className="sticky top-0 z-40 bg-[#F7F3E8] border-b border-[#E9D7B5]/60 h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] px-5 flex items-center justify-between">
        <Link
          href={backHref}
          data-navigation-direction="back"
          aria-label="ย้อนกลับ"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70 hover:bg-[#FAF7F0] active:scale-95 transition-all text-[#2E2318] shadow-warm-xs shrink-0"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </Link>

        {title ? (
          <h1 className="font-bold text-[#2E2318] text-[15px] truncate max-w-[180px] text-center px-2">
            {title}
          </h1>
        ) : <div />}

        <div className="flex items-center gap-2">
          {favoriteType && favoriteId && (
            <FavoriteButton
              type={favoriteType}
              id={favoriteId}
              name={title}
              variant="header"
              size={20}
            />
          )}

          <Link
            href="/cart"
            aria-label={`ตะกร้า ${count} รายการ`}
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70 hover:bg-[#FAF7F0] active:scale-95 transition-all text-[#2E2318] shadow-warm-xs shrink-0"
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4.5 rounded-full bg-market-orange text-white text-[9px] font-bold shadow-xs px-1">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      <div className="detail-hero">
        <ImageWithSkeleton
          src={src}
          alt={alt}
          wrapperClassName="absolute inset-0"
          className="object-cover"
          fallbackSrc="/images/food/default.jpg"
        />
        {closed && (
          <span className="absolute bottom-8 left-5 z-10 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-market-dark shadow-xs">
            ปิดให้บริการ
          </span>
        )}
      </div>
    </div>
  )
}
