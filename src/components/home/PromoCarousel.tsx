'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Sparkles, ChevronRight } from 'lucide-react'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'

interface BannerItem {
  id: string
  tag: string
  title: string
  subtitle: string
  buttonText: string
  link: string
  image: string
  accentColor: string
  tagBg: string
}

const BANNERS: BannerItem[] = [
  {
    id: 'b1',
    tag: 'สั่งล่วงหน้า ไม่ต้องรอคิว',
    title: 'หิวเมื่อไหร่ สั่งไว้ก่อน',
    subtitle: 'เดินถึงตลาดริมชล รับอาหารอุ่นๆ หน้าร้านได้ทันที',
    buttonText: 'ดูเมนูยอดนิยม',
    link: '#popular-section',
    image: '/images/stalls/krapal.webp',
    accentColor: '#A67C52',
    tagBg: 'bg-[#2E2318]/90 text-white',
  },
  {
    id: 'b2',
    tag: 'โซนริมน้ำ ตลาดมหาวิทยาลัย',
    title: 'รวมของอร่อยกว่า 15 ร้าน',
    subtitle: 'ทั้งก๋วยเตี๋ยว ซีฟู้ด อาหารจานเดียว และของหวานชื่นใจ',
    buttonText: 'สำรวจร้านค้า',
    link: '/shops',
    image: '/images/stalls/noodle.webp',
    accentColor: '#F4A261',
    tagBg: 'bg-market-orange text-white',
  },
  {
    id: 'b3',
    tag: 'เปิดทุกวัน 10:00 - 20:00',
    title: 'อิ่มอร่อยริมแม่น้ำ',
    subtitle: 'บรรยากาศดี ลมพัดสบาย พร้อมพื้นที่นั่งทานริมชล',
    buttonText: 'ดูร้านค้าทั้งหมด',
    link: '/shops',
    image: '/images/stalls/seafood.webp',
    accentColor: '#7DA27D',
    tagBg: 'bg-emerald-700 text-white',
  },
]

export function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [paused, setPaused] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const didSwipeRef = useRef(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length)
  }, [])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)
  }, [])

  // Auto-slide every 5 seconds (pauses when user touches)
  useEffect(() => {
    if (isSwiping || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    autoPlayRef.current = setInterval(goToNext, 5000)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [goToNext, isSwiping, paused])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    setTouchStart(e.touches[0].clientX)
    setIsSwiping(true)
    setTouchDelta(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const currentX = e.touches[0].clientX
    const delta = currentX - touchStart
    setTouchDelta(delta)
  }

  const handleTouchEnd = () => {
    if (touchDelta < -45) {
      goToNext()
      didSwipeRef.current = true
    } else if (touchDelta > 45) {
      goToPrev()
      didSwipeRef.current = true
    }
    setTouchStart(null)
    setTouchDelta(0)
    setIsSwiping(false)
    window.setTimeout(() => {
      didSwipeRef.current = false
    }, 0)
  }

  // Mouse drag handlers for desktop testing
  const [mouseStart, setMouseStart] = useState<number | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    setMouseStart(e.clientX)
    setIsSwiping(true)
    setTouchDelta(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStart === null) return
    const delta = e.clientX - mouseStart
    setTouchDelta(delta)
  }

  const handleMouseUp = () => {
    if (mouseStart !== null) {
      if (touchDelta < -45) {
        goToNext()
      } else if (touchDelta > 45) {
        goToPrev()
      }
    }
    setMouseStart(null)
    setTouchDelta(0)
    setIsSwiping(false)
  }

  return (
    <div className="w-full select-none">
      {/* Carousel Track Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing rounded-[24px] touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex transition-transform ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${touchDelta}px))`,
            transitionDuration: isSwiping ? '0ms' : '350ms',
          }}
        >
          {BANNERS.map((b) => (
            <div key={b.id} className="w-full flex-shrink-0">
              <div className="relative h-[155px] sm:h-[165px] rounded-[24px] overflow-hidden bg-[#2E2318] shadow-warm border border-[#E9D7B5]/60 group">
                {/* Background Image with Dark Vignette Gradient */}
                <ImageWithSkeleton
                  wrapperClassName="absolute inset-0"
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#2E2318] via-[#2E2318]/90 to-transparent" />

                {/* Content Overlay */}
                <div className="relative h-full flex flex-col justify-between p-4 z-10">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wide ${b.tagBg}`}
                    >
                      <Sparkles size={11} strokeWidth={2.6} /> {b.tag}
                    </span>
                    <h3 className="font-bold text-white text-[17px] leading-snug mt-1.5 drop-shadow-xs">
                      {b.title}
                    </h3>
                    <p className="text-[#E9D7B5] text-[12px] leading-tight line-clamp-1 mt-0.5 font-medium">
                      {b.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={b.link}
                      onClick={(e) => {
                        if (didSwipeRef.current) {
                          e.preventDefault()
                          didSwipeRef.current = false
                        }
                      }}
                      className="inline-flex min-h-11 items-center gap-1 text-xs font-bold bg-white text-[#2E2318] px-3 py-1.5 rounded-full shadow-xs active:scale-95 hover:bg-[#FAF7F0] transition-all"
                    >
                      {b.buttonText}
                      <ChevronRight size={13} strokeWidth={2.8} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Swipe Indicators (Animated Dots / Pill) */}
      <div className="flex items-center justify-center pt-1 pb-0.5">
        {BANNERS.map((_, i) => {
          const isActive = currentIndex === i
          return (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setPaused(true) }}
              className="w-5 h-5 flex items-center justify-center"
              aria-pressed={isActive}
              aria-label={`ไปยังแบนเนอร์ที่ ${i + 1}`}
            ><span className={`h-1.5 rounded-full transition-all ${isActive ? 'w-6 bg-market-brown' : 'w-1.5 bg-[#D4B896]'}`} /></button>
          )
        })}
      </div>
    </div>
  )
}
