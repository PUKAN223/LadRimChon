'use client'

import React, { useState } from 'react'
import { Heart } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  toggleFavoriteShop,
  toggleFavoriteProduct,
  selectIsShopFavorite,
  selectIsProductFavorite,
} from '@/store/slices/favorites.slice'

interface FavoriteButtonProps {
  type: 'shop' | 'product'
  id: string
  name?: string
  size?: number
  variant?: 'floating' | 'subtle' | 'header' | 'inline'
  className?: string
}

export function FavoriteButton({
  type,
  id,
  name,
  size = 15,
  variant = 'subtle',
  className = '',
}: FavoriteButtonProps) {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector(
    type === 'shop' ? selectIsShopFavorite(id) : selectIsProductFavorite(id)
  )
  const [bouncing, setBouncing] = useState(false)

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setBouncing(true)
    setTimeout(() => setBouncing(false), 260)

    if (type === 'shop') {
      dispatch(toggleFavoriteShop(id))
    } else {
      dispatch(toggleFavoriteProduct(id))
    }
  }

  const baseStyles =
    'inline-flex items-center justify-center transition-all duration-150 focus:outline-none select-none'

  const variantStyles = {
    floating: isFavorite
      ? 'w-7.5 h-7.5 rounded-full bg-white/95 text-rose-500 shadow-2xs border border-white/80 hover:scale-105 active:scale-90'
      : 'w-7.5 h-7.5 rounded-full bg-black/35 hover:bg-black/50 text-white/85 hover:text-white backdrop-blur-xs border border-white/20 active:scale-90',
    header: isFavorite
      ? 'w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70 text-rose-500 hover:bg-[#FAF7F0] active:scale-95 transition-all shadow-warm-xs shrink-0'
      : 'w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70 text-[#8A7B6D] hover:text-[#2E2318] hover:bg-[#FAF7F0] active:scale-95 transition-all shadow-warm-xs shrink-0',
    subtle: isFavorite
      ? 'w-7 h-7 rounded-full text-rose-500 bg-rose-50/70 active:scale-90'
      : 'w-7 h-7 rounded-full text-[#A89A8C] hover:text-[#2E2318] hover:bg-black/5 active:scale-90',
    inline: isFavorite
      ? 'p-1 text-rose-500 active:scale-90'
      : 'p-1 text-[#A89A8C] hover:text-[#2E2318] active:scale-90',
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isFavorite
          ? `ลบ ${name || (type === 'shop' ? 'ร้าน' : 'เมนู')} ออกจากรายการโปรด`
          : `บันทึก ${name || (type === 'shop' ? 'ร้าน' : 'เมนู')} ในรายการโปรด`
      }
      aria-pressed={isFavorite}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <Heart
        size={size}
        strokeWidth={1.9}
        className={`transition-transform duration-200 ${bouncing ? 'scale-125' : 'scale-100'
          } ${isFavorite
            ? 'fill-rose-500 text-rose-500'
            : 'text-current'
          }`}
      />
    </button>
  )
}
