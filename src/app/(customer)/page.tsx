'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, ChevronRight, X, Flame, Store, Star, Plus, Clock, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { Shop } from '@/domain/shop/shop.model'
import { Product } from '@/domain/product/product.model'
import { Order, ORDER_STATUS_LABEL } from '@/domain/order/order.model'
import { getShopRepository, getProductRepository, getOrderRepository } from '@/lib/repositories'
import { SEED_SHOPS, SEED_PRODUCTS } from '@/repositories/adapters/local-storage/seed.data'
import { ShopCard } from '@/components/shop/ShopCard'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setSelectedCategory, setSearchQuery } from '@/store/slices/ui.slice'
import { useRouter } from 'next/navigation'
import { PromoCarousel } from '@/components/home/PromoCarousel'

const BRAND_CATEGORIES = [
  { id: 'rice', label: 'อาหารตามสั่ง', image: '/images/category-rice-hd.png' },
  { id: 'snack', label: 'ของทานเล่น', image: '/images/category-snack-hd.png' },
  { id: 'drink', label: 'เครื่องดื่ม', image: '/images/category-drink-hd.png' },
  { id: 'dessert', label: 'ของหวาน', image: '/images/category-dessert-hd.png' },
]
const RECENT_SEARCHES_KEY = 'ladrimchon_recent_searches_v1'
const MAX_RECENT_SEARCHES = 5

const initialShopProducts: Record<string, Product[]> = {}
SEED_SHOPS.forEach((s) => {
  initialShopProducts[s.id] = SEED_PRODUCTS.filter((p) => p.shopId === s.id)
})

export default function HomePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)
  const searchQuery = useAppSelector((s) => s.ui.searchQuery)

  const user = useAppSelector((s) => s.session.user)
  const [shops, setShops] = useState<Shop[]>(SEED_SHOPS)
  const [popularProducts, setPopularProducts] = useState<Product[]>(() => SEED_PRODUCTS.slice(0, 8))
  const [shopProducts, setShopProducts] = useState<Record<string, Product[]>>(initialShopProducts)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const filterDialog = useRef<HTMLDialogElement>(null)
  const [stallsScrollProgress, setStallsScrollProgress] = useState(0)
  const [sheetDragY, setSheetDragY] = useState(0)
  const [sheetStartY, setSheetStartY] = useState<number | null>(null)
  const [isDraggingSheet, setIsDraggingSheet] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const [draftSearch, setDraftSearch] = useState(searchQuery)

  const stickySentinelRef = useRef<HTMLDivElement>(null)
  const stallsRef = useRef<HTMLDivElement>(null)

  const handleStallsScroll = () => {
    if (!stallsRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = stallsRef.current
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll > 0) {
      setStallsScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)))
    }
  }

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    setSheetStartY(e.touches[0].clientY)
    setIsDraggingSheet(true)
  }

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (sheetStartY === null) return
    const delta = e.touches[0].clientY - sheetStartY
    if (delta > 0) {
      setSheetDragY(delta)
    }
  }

  const handleSheetTouchEnd = () => {
    if (sheetDragY > 75) {
      setShowFilterModal(false)
    }
    setSheetDragY(0)
    setSheetStartY(null)
    setIsDraggingSheet(false)
  }

  useEffect(() => {
    if (!showFilterModal) return
    const node = filterDialog.current
    const overflow = document.body.style.overflow
    node?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { node?.close(); document.body.style.overflow = overflow }
  }, [showFilterModal])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        window.scrollY ||
        document.body.scrollTop ||
        0

      let sentinelTop = 999
      if (stickySentinelRef.current) {
        sentinelTop = stickySentinelRef.current.getBoundingClientRect().top
      }

      // Sticky state activates when the sentinel passes near top of viewport (<= 20px) or user scrolled past hero
      setIsSticky(sentinelTop <= 20 || scrollY > 260)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const shopRepo = getShopRepository()
        const productRepo = getProductRepository()
        const orderRepo = getOrderRepository()

        const [allShops, popular, userOrders] = await Promise.all([
          shopRepo.getShops().catch(() => SEED_SHOPS),
          productRepo.getPopularProducts().catch(() => SEED_PRODUCTS.slice(0, 8)),
          orderRepo.getOrders(user?.id || 'user-demo').catch(() => []),
        ])

        const validShops = allShops && allShops.length > 0 ? allShops : SEED_SHOPS
        const validPopular = popular && popular.length > 0 ? popular : SEED_PRODUCTS.slice(0, 8)

        setShops(validShops)
        setPopularProducts(validPopular)

        const active = (userOrders || []).find(
          (o: Order) => o.status !== 'completed' && o.status !== 'cancelled'
        )
        if (active) setActiveOrder(active)

        // Fetch products for each shop to populate the stall food preview list
        const prodMap: Record<string, Product[]> = {}
        await Promise.all(
          validShops.map(async (shop: Shop) => {
            try {
              const prods = await productRepo.getProducts(shop.id)
              prodMap[shop.id] = prods && prods.length > 0 ? prods : SEED_PRODUCTS.filter((p) => p.shopId === shop.id)
            } catch {
              prodMap[shop.id] = SEED_PRODUCTS.filter((p) => p.shopId === shop.id)
            }
          })
        )
        setShopProducts(prodMap)
      } catch (err) {
        console.error('Error loading market data:', err)
        setShops(SEED_SHOPS)
        setPopularProducts(SEED_PRODUCTS.slice(0, 8))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
      if (Array.isArray(saved)) setRecentSearches(saved.filter((term): term is string => typeof term === 'string').slice(0, MAX_RECENT_SEARCHES))
    } catch { /* Search history is optional when browser storage is unavailable. */ }
  }, [])

  const saveRecentSearch = (value: string) => {
    const term = value.trim()
    if (!term) return
    setRecentSearches((current) => {
      const next = [term, ...current.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT_SEARCHES)
      try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)) } catch { /* Keep in-memory history only. */ }
      return next
    })
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    try { localStorage.removeItem(RECENT_SEARCHES_KEY) } catch { /* Storage may be disabled. */ }
  }

  const submitSearch = () => {
    const term = draftSearch.trim()
    dispatch(setSearchQuery(term))
    saveRecentSearch(term)
    setShowRecentSearches(false)
  }

  const handleAddToCart = (product: Product, shop: Shop) => {
    if (!shop.isOpen || !product.isAvailable || product.stock === 0) return
    router.push(`/menu/${product.id}`)
  }

  // Keep typing responsive while the shop and menu index is filtered in the background.
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const filteredShops = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()
    return shops.filter((s) => {
    const matchesSearch = !query || [s.name, s.zone, String(s.shopNumber ?? ''), s.description,
    ...s.tags, ...(shopProducts[s.id] ?? []).map((p) => p.name)]
      .some((text) => text.toLowerCase().includes(query))
    const matchesCategory = (() => {
      if (!selectedCategory) return true
      if (selectedCategory === 'rice') return s.category === 'rice' || s.category === 'noodle' || s.category === 'thai' || s.tags.some(t => t.includes('อาหาร') || t.includes('ข้าว'))
      if (selectedCategory === 'snack') return s.category === 'snack' || s.category === 'seafood' || s.category === 'international' || s.tags.some(t => t.includes('ทานเล่น') || t.includes('ซีฟู้ด'))
      if (selectedCategory === 'drink') return s.category === 'drink' || s.category === 'dessert' || s.tags.some(t => t.includes('เครื่องดื่ม') || t.includes('ชา'))
      if (selectedCategory === 'dessert') return s.category === 'dessert' || s.tags.some(t => t.includes('เค้ก') || t.includes('ของหวาน') || t.includes('เบเกอรี่'))
      return s.category === selectedCategory
    })()
      return matchesSearch && matchesCategory
    })
  }, [deferredSearchQuery, selectedCategory, shopProducts, shops])
  const openShopCount = shops.filter((shop) => shop.isOpen).length

  return (
    <div className="animate-fade-in bg-market-cream">

      {/* ── SECTION 1: HEADER & GREETING (Warm Cream) ────────────────────── */}
      <div className="px-5 pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)))] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-market-dark font-bold text-[24px] leading-tight flex items-center gap-1.5">
              สวัสดี
            </h1>
            <p className="text-market-dark text-[20px] font-bold tracking-tight mt-0.5">
              หิวแล้วใช่ไหม?
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-market-brown font-semibold flex items-center gap-1">
                <img src="/images/feat-waves.png" alt="" className="h-2 object-contain inline opacity-80" />
                หลาดริมชลหนนคนเดิน
              </span>
            </div>
          </div>
          <div className="w-25 h-25 flex items-center justify-center shrink-0">
            <img
              src="/images/mascot-header-transparent.png"
              alt="หลาดริมชล"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Live Active Order Card */}
        {activeOrder && (
          <Link
            href={`/orders/${activeOrder.id}`}
            className="mt-3 flex items-center justify-between bg-white border border-market-orange/60 rounded-2xl p-3 shadow-warm-xs hover:border-market-orange transition-all group animate-slide-up"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-market-orange/15 flex items-center justify-center text-market-orange shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-market-orange animate-ping" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-market-dark text-xs flex items-center gap-1.5 truncate">
                  <span>กำลังดำเนินการ: #{activeOrder.orderNumber}</span>
                  <span className="text-market-muted font-normal truncate">({activeOrder.shopName})</span>
                </p>

                <p className="text-market-brown text-[11px] font-semibold mt-0.5">
                  สถานะ: {ORDER_STATUS_LABEL[activeOrder.status]} · แตะเพื่อติดตาม
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-market-orange group-hover:translate-x-0.5 transition-transform shrink-0 ml-2 flex items-center">
              ติดตาม <ChevronRight size={15} strokeWidth={2.6} className="ml-0.5" />
            </span>
          </Link>
        )}
      </div>

      {/* ── SWIPEABLE HERO PROMO CAROUSEL (ปัดซ้าย-ปัดขวา ก่อน Search Bar) ── */}
      <div className="px-5">
        <PromoCarousel />
      </div>

      {/* Sentinel element right before sticky search to detect when it sticks to top */}
      <div ref={stickySentinelRef} className="h-0 w-full pointer-events-none" />

      {/* ── STICKY SEARCH BAR (Stays fixed when scrolling down) ─────────── */}
      <div className="sticky top-0 z-30 bg-market-cream/98 backdrop-blur-md px-5 pt-[max(0.35rem,calc(env(safe-area-inset-top,0px)+0.25rem))] pb-4 transition-all border-b border-market-beige/60 shadow-[0_4px_16px_rgba(46,35,24,0.04)]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              id="home-search"
              placeholder="ค้นหาร้าน หรือเมนูอาหาร..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onFocus={() => setShowRecentSearches(true)}
              onBlur={() => setTimeout(() => setShowRecentSearches(false), 120)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitSearch()
                  event.currentTarget.blur()
                }
              }}
              className="w-full pl-4 pr-22 py-3 bg-[#FFFDF8] rounded-2xl text-[14px] text-market-dark placeholder:text-market-muted focus:outline-none shadow-warm-xs border border-market-orange/35 focus:border-market-orange focus:ring-4 focus:ring-market-orange/10 transition-all font-medium"
            />
            {draftSearch && (
              <button
                type="button"
                onClick={() => { setDraftSearch(''); dispatch(setSearchQuery('')) }}
                className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-[#FAF7F0] text-[#4A382A] hover:bg-gray-200 text-xs"
              >
                <X size={14} strokeWidth={2.8} />
              </button>
            )}
            <button type="button" onClick={submitSearch} aria-label="ค้นหา" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-market-orange text-market-dark flex items-center justify-center shadow-xs hover:bg-[#F8B176] active:scale-95 transition-all"><Search size={17} strokeWidth={2.8} /></button>

            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-40 bg-white border border-market-beige/70 shadow-warm rounded-2xl p-3 animate-slide-up">
                <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold text-market-muted flex items-center gap-1.5"><Clock size={13} /> ค้นหาล่าสุด</span><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={clearRecentSearches} className="text-[11px] font-bold text-market-brown hover:text-market-dark">ล้าง</button></div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {recentSearches.map((term) => <button key={term} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setDraftSearch(term); dispatch(setSearchQuery(term)); setShowRecentSearches(false) }} className="shrink-0 max-w-40 truncate bg-market-cream border border-market-beige/70 text-market-dark text-xs font-medium px-3 py-2 rounded-xl hover:border-market-brown active:scale-95 transition-all">{term}</button>)}
                </div>
              </div>
            )}
          </div>

          {/* Filter Button beside input - Only shows when in sticky state */}
          {isSticky && (
            <button
              onClick={() => setShowFilterModal(true)}
              id="filter-toggle-button"
              className={`relative flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all active:scale-95 shrink-0 shadow-warm-xs animate-slide-up ${selectedCategory
                ? 'bg-market-brown text-white shadow-sm'
                : 'bg-white text-market-dark hover:border-market-brown'
                }`}
              title="ตัวกรอง"
            >
              <SlidersHorizontal size={20} strokeWidth={2.6} className={selectedCategory ? 'text-white' : 'text-market-dark'} />
              {selectedCategory && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-market-orange ring-2 ring-white" />
              )}
            </button>
          )}
        </div>

        {/* Active Filter Pill - Only in sticky state (normal state already displays category cards below) */}
        {isSticky && selectedCategory && (
          <div className="flex items-center gap-1.5 pt-2 animate-slide-up">
            <span className="text-[11px] font-medium text-market-muted">กรอง:</span>
            <span className="inline-flex items-center gap-1 bg-market-brown text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              {BRAND_CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}
              <button
                onClick={() => dispatch(setSelectedCategory(null))}
                className="hover:opacity-75 transition-opacity ml-0.5"
                title="ล้างตัวกรอง"
              >
                <X size={12} strokeWidth={2.8} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* ── CATEGORIES (4 Items on Warm Cream Background) ──────────────── */}
      <div className="px-5 pt-4 pb-5">
        <div className="grid grid-cols-4 gap-2.5">
          {BRAND_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => dispatch(setSelectedCategory(isActive ? null : cat.id))}
                className="flex flex-col items-center group active:scale-90 active:-translate-y-0.5 transition-all duration-150"
              >
                <div
                  className={`w-full aspect-square rounded-2xl p-2 bg-white flex items-center justify-center transition-all duration-200 ${isActive
                    ? 'ring-2 ring-market-brown shadow-warm scale-[1.02]'
                    : 'shadow-warm-xs border border-market-beige/50 group-hover:border-market-brown/40 group-active:shadow-2xs'
                    }`}
                >
                  <img src={cat.image} alt={cat.label} className="w-14 h-14 object-contain group-hover:scale-105 transition-transform" />
                </div>
                <span
                  className={`text-[12px] font-medium text-center mt-1.5 leading-tight ${isActive ? 'text-market-brown font-bold' : 'text-[#4A382A]'
                    }`}
                >
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── RESTAURANTS & DISHES ───────────────────────────────────────── */}
      <div className="bg-white rounded-t-3xl border-t border-market-beige/70 shadow-[0_-8px_24px_rgba(46,35,24,0.03)] px-5 pt-5 pb-32 space-y-7 mt-5 min-h-screen">

        {/* ── Search / Filter Results ─────────────────── */}
        {searchQuery || selectedCategory ? (
          <section className="animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-market-dark text-base">
                {selectedCategory
                  ? BRAND_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'ผลการค้นหา'
                  : 'ผลการค้นหา'}
                <span className="ml-2 text-xs font-normal text-market-muted">
                  ({filteredShops.length} ร้าน)
                </span>
              </h2>
              <button
                onClick={() => {
                  dispatch(setSelectedCategory(null))
                  dispatch(setSearchQuery(''))
                }}
                className="text-xs text-market-orange font-semibold hover:underline"
              >
                ล้างตัวกรอง
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl overflow-hidden shadow-warm-xs border border-market-beige/60"
                  >
                    <div className="h-40 skeleton-shimmer" />
                    <div className="p-4 space-y-2.5">
                      <div className="h-4.5 w-2/5 rounded-md skeleton-shimmer" />
                      <div className="h-3.5 w-3/5 rounded-md skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-10 bg-[#FAF7F0] rounded-3xl border border-market-beige/50 shadow-warm-xs p-6">
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <img
                    src="/images/feat-food.png"
                    alt="ไม่พบร้าน"
                    className="w-full h-full object-contain opacity-70"
                  />
                </div>
                <p className="text-market-dark font-bold text-base">ไม่พบร้านหรือเมนูที่ค้นหา</p>
                <p className="text-market-muted text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อาหารอื่น</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    variant="stall"
                    previewProducts={shopProducts[shop.id]}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* ── SECTION 1: STALLS RAIL (แถบร้านค้าแนวนอน เหมือน Grab / LINE MAN) ──────────────── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store size={20} strokeWidth={2.6} className="text-market-orange" />
                  <h2 className="font-bold text-market-dark text-[17px]">ร้านค้า</h2>
                  <span className="bg-white border border-market-beige/70 text-market-brown text-[10px] font-bold px-2 py-0.5 rounded-full">เปิด {openShopCount}</span>
                </div>
                <Link
                  href="/shops"
                  className="text-market-muted text-xs font-semibold flex items-center gap-0.5 hover:text-market-brown transition-colors"
                >
                  ดูทั้งหมด <ChevronRight size={15} strokeWidth={2.6} className="inline ml-0.5" />
                </Link>
              </div>

              {loading ? (
                <div className="flex gap-3 overflow-hidden -mx-5 px-5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-50 sm:w-55 shrink-0 bg-white rounded-2xl overflow-hidden border border-market-beige/50 shadow-warm-xs"
                    >
                      <div className="h-28 skeleton-shimmer relative" />
                      <div className="p-2.5 space-y-2">
                        <div className="h-3.5 w-3/4 rounded-md skeleton-shimmer" />
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-10 rounded-md skeleton-shimmer" />
                          <div className="h-3 w-16 rounded-md skeleton-shimmer" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div
                    ref={stallsRef}
                    onScroll={handleStallsScroll}
                    className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory overscroll-x-contain scroll-smooth"
                  >
                    {shops.map((shop) => (
                      <Link
                        key={shop.id}
                        href={`/shops/${shop.id}`}
                        className="w-54 sm:w-58 shrink-0 bg-white rounded-2xl overflow-hidden border border-market-beige/60 shadow-warm-xs hover:shadow-warm-sm active:scale-[0.97] transition-all group block snap-start scroll-ml-5"
                      >
                        <div className="h-30 bg-gray-100 relative overflow-hidden">
                          <img
                            src={shop.coverUrl || shop.imageUrl}
                            alt={shop.name}
                            className="w-full h-[calc(100%+20px)] -translate-y-5   object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/stalls/krapal.webp'
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            <span className="bg-market-dark/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                              <Store size={12} strokeWidth={2.6} className="text-market-orange" />
                              ร้านที่ {shop.shopNumber}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="bg-market-dark/85 backdrop-blur-md text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                              <Star size={12} strokeWidth={2.4} className="fill-amber-400 text-amber-400" />
                              {shop.rating}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5">
                          <h3 className="font-bold text-market-dark text-[13px] truncate group-hover:text-market-brown transition-colors">
                            {shop.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-market-muted mt-1 font-medium">
                            <span className="flex items-center gap-0.5">
                              <Clock size={13} strokeWidth={2.4} /> {shop.preparationTime} นาที
                            </span>
                            <span>•</span>
                            <span className="truncate">{shop.tags[0] || 'อาหารจานเดียว'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Horizontal Swipe Progress Indicator */}
                  <div className="flex items-center justify-between pt-1 px-1">
                    <span className="text-[11px] text-market-muted font-medium flex items-center gap-1.5">
                      {/* <span className="w-1.5 h-1.5 rounded-full bg-market-orange animate-pulse" /> */}
                    </span>
                    <div className="w-16 h-1 bg-market-beige/60 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-market-orange rounded-full transition-all duration-150"
                        style={{
                          width: '40%',
                          transform: `translateX(${stallsScrollProgress * 150}%)`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* ── SECTION 2: POPULAR DISHES GRID (2 คอลัมน์ เมนูยอดนิยม) ──────────────── */}
            <section id="popular-section" className="scroll-mt-24">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Flame size={20} strokeWidth={2.6} className="text-market-orange fill-market-orange/20" />
                  <h2 className="font-bold text-market-dark text-[17px]">เมนูยอดนิยม</h2>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-2.5 border border-market-beige/60 shadow-warm-xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="w-full aspect-square rounded-xl skeleton-shimmer" />
                      <div className="space-y-1.5 pt-1">
                        <div className="h-3.5 w-4/5 rounded-md skeleton-shimmer" />
                        <div className="h-2.5 w-3/5 rounded-md skeleton-shimmer" />
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-[#FAF7F0]">
                        <div className="h-3.5 w-10 rounded-md skeleton-shimmer" />
                        <div className="w-7 h-7 rounded-full skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {popularProducts.slice(0, 8).map((product) => {
                    const shop = shops.find((s) => s.id === product.shopId)
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl p-2.5 border border-market-beige/60 shadow-warm-xs hover:shadow-warm-sm transition-all group flex flex-col justify-between"
                      >
                        <Link href={`/menu/${product.id}`} className="block">
                          <div className="w-full aspect-square rounded-xl bg-gray-100 overflow-hidden relative shadow-2xs">
                            <img
                              src={product.imageUrl || '/images/food/default.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/food/default.jpg'
                              }}
                            />
                          </div>
                          <h4 className="font-bold text-market-dark text-[13px] line-clamp-1 mt-2 group-hover:text-market-brown transition-colors">
                            {product.name}
                          </h4>
                          {shop && (
                            <p className="text-[11px] text-market-muted line-clamp-1 mt-0.5 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-market-orange/80 shrink-0" />
                              <span className="truncate">ร้านที่ {shop.shopNumber} · {shop.name.replace('ร้านก๋วยเตี๋ยว', 'ก๋วยเตี๋ยว').replace('ร้าน', '').replace('ริมชล', '').replace('ริมน้ำ', '').trim()}</span>
                            </p>
                          )}
                        </Link>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#FAF7F0]">
                          <span className="font-black text-market-brown text-[14px]">
                            ฿{product.price}
                          </span>
                          <button
                            onClick={() => {
                              if (shop) {
                                handleAddToCart(product, shop)
                              }
                            }}
                            className="w-11 h-11 rounded-full bg-market-orange text-white hover:bg-[#E8894E] active:scale-90 flex items-center justify-center shadow-xs transition-transform"
                            disabled={!shop?.isOpen || !product.isAvailable || product.stock === 0}
                            aria-label={`เลือก ${product.name}`}
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Cover the shared bottom-navigation reserve so the page ends in the white content surface. */}
      <div
        aria-hidden="true"
        className="h-[calc(5.75rem+env(safe-area-inset-bottom,0px))] -mb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] bg-white"
      />

      {/* ── FILTER BOTTOM SHEET MODAL (Rendered via Portal to sit above navbar & floating elements) ── */}
      {showFilterModal && createPortal(
        <dialog ref={filterDialog} className="filter-dialog" aria-labelledby="filter-title" onCancel={() => setShowFilterModal(false)}>

          {/* Sheet with Touch Drag-Down to Dismiss */}
          <div
            className="relative w-full max-w-107.5 bg-white rounded-t-3xl border-t border-market-beige/80 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] p-5 z-10 pb-[max(2.25rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))]"
            style={{
              transform: `translateY(${sheetDragY}px)`,
              transition: isDraggingSheet ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Tactile Handle bar (Touch Drag Area) */}
            <div
              className="py-1 cursor-grab active:cursor-grabbing touch-none select-none"
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
            >
              <div className="w-12 h-1.5 bg-[#D4B896] rounded-full mx-auto mb-1 opacity-80 hover:bg-market-brown transition-colors" />
              <p className="text-[10px] text-center text-market-muted mb-2 font-medium">ปัดลงเพื่อปิด</p>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F0]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} strokeWidth={2.6} className="text-market-orange" />
                <h3 id="filter-title" className="font-bold text-market-dark text-base">ตัวกรองหมวดหมู่</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                aria-label="ปิดตัวกรอง"
                className="w-11 h-11 rounded-full bg-[#FAF7F0] hover:bg-[#F0ECE1] flex items-center justify-center text-[#4A382A] transition-colors active:scale-90"
              >
                <X size={18} strokeWidth={2.8} />
              </button>
            </div>

            {/* Categories list */}
            <div className="py-4 space-y-2">
              <p className="text-xs font-semibold text-market-muted">เลือกหมวดหมู่</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory(null))
                    setShowFilterModal(false)
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${selectedCategory === null
                    ? 'bg-market-dark text-white border-market-dark font-bold shadow-warm-xs'
                    : 'bg-[#FAF7F0] text-market-dark border-market-beige/60 hover:bg-[#F4EFE6] font-medium'
                    }`}
                >
                  <span className="text-xs">ทุกหมวดหมู่ (ทั้งหมด)</span>
                </button>

                {BRAND_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        dispatch(setSelectedCategory(isActive ? null : cat.id))
                        setShowFilterModal(false)
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${isActive
                        ? 'bg-market-brown text-white border-market-brown font-bold shadow-warm-xs'
                        : 'bg-[#FAF7F0] text-market-dark border-market-beige/60 hover:bg-[#F4EFE6] font-medium'
                        }`}
                    >
                      <img src={cat.image} alt={cat.label} className="w-6 h-6 object-contain" />
                      <span className="text-xs truncate">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-[#FAF7F0]">
              {selectedCategory && (
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory(null))
                    setShowFilterModal(false)
                  }}
                  className="flex-1 py-3.5 rounded-2xl border border-market-beige text-market-muted hover:text-market-dark text-xs font-semibold hover:bg-[#FAF7F0] transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              )}
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3.5 rounded-2xl bg-market-orange text-white text-xs font-bold hover:bg-[#E8894E] shadow-warm-xs transition-colors text-center active:scale-95"
              >
                ดูผลลัพธ์
              </button>
            </div>
          </div>
        </dialog>,
        document.body
      )}
    </div>
  )
}
