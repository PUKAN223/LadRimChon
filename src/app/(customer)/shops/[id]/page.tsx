'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Shop } from '@/domain/shop/shop.model'
import { Product } from '@/domain/product/product.model'
import { getShopRepository, getProductRepository } from '@/lib/repositories'
import { SEED_SHOPS, SEED_PRODUCTS } from '@/repositories/adapters/local-storage/seed.data'
import { FoodCard } from '@/components/food/FoodCard'
import { DetailHero } from '@/components/market/DetailHero'
import { Star, Clock, MapPin, SearchX, UtensilsCrossed, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const initialShop = SEED_SHOPS.find((item) => item.id === id) || null
  const initialProducts = SEED_PRODUCTS.filter((item) => item.shopId === id)

  const [shop, setShop] = useState<Shop | null>(initialShop)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [activeCategory, setActiveCategory] = useState<string>(initialShop?.menuCategories[0]?.id || '')
  const [loading, setLoading] = useState(false)

  const handleAddToCart = (product: Product) => {
    if (!shop) return
    if (!shop.isOpen || !product.isAvailable || product.stock === 0) return
    router.push(`/menu/${product.id}`)
  }

  useEffect(() => {
    const load = async () => {
      try {
        const shopRepo = getShopRepository()
        const productRepo = getProductRepository()
        const [s, p] = await Promise.all([
          shopRepo.getShop(id).catch(() => null),
          productRepo.getProducts(id).catch(() => []),
        ])
        const foundShop = s || SEED_SHOPS.find((item) => item.id === id) || null
        const foundProducts = (p && p.length > 0) ? p : SEED_PRODUCTS.filter((item) => item.shopId === id)
        setShop(foundShop)
        setProducts(foundProducts)
        if (foundShop?.menuCategories[0]) setActiveCategory(foundShop.menuCategories[0].id)
      } catch (err) {
        console.error('Failed to load shop:', err)
        const fallbackShop = SEED_SHOPS.find((item) => item.id === id) || null
        setShop(fallbackShop)
        setProducts(SEED_PRODUCTS.filter((item) => item.shopId === id))
        if (fallbackShop?.menuCategories[0]) setActiveCategory(fallbackShop.menuCategories[0].id)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3E8]">
        <div className="sticky top-0 z-30 w-full h-[env(safe-area-inset-top,0px)] bg-[#F7F3E8]" />
        <div className="relative">
          <div className="detail-hero skeleton-shimmer" />
          <nav aria-label="การนำทาง" className="detail-hero-actions">
            <Link href="/shops" aria-label="ย้อนกลับ" className="detail-float-button">
              <ChevronLeft size={22} strokeWidth={2} />
            </Link>
          </nav>
        </div>
        <div className="space-y-4">
          <div className="detail-surface space-y-3">
            <div className="h-6 w-1/2 rounded-md skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 space-y-2 border border-[#E9D7B5]/60 shadow-warm-xs">
                  <div className="w-full aspect-square rounded-xl skeleton-shimmer" />
                  <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                  <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <SearchX size={48} className="text-market-brown/40" />
        <p className="text-market-dark font-semibold">ไม่พบร้านนี้</p>
        <Link href="/" className="text-market-orange font-medium hover:underline">
          กลับหน้าแรก
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <DetailHero src={shop.coverUrl || shop.imageUrl || '/images/food/default.jpg'} alt={shop.name} backHref="/shops" closed={!shop.isOpen} />

      {/* Shop Info */}
      <div className="detail-surface space-y-6">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-bold text-market-dark text-xl">{shop.name}</h1>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                shop.isOpen
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {shop.isOpen ? 'เปิดบริการ' : 'ปิดชั่วคราว'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{shop.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
            <span className="flex items-center gap-1 text-sm text-market-orange font-bold">
              <Star size={15} strokeWidth={2.4} className="fill-amber-500 text-amber-500" /> {shop.rating} ({shop.reviewCount})
            </span>
            <span className="flex items-center gap-1 text-sm text-[#6B5A4B] font-medium">
              <Clock size={15} strokeWidth={2.4} /> ~{shop.preparationTime} นาที
            </span>
            <span className="flex items-center gap-1 text-sm text-[#6B5A4B] font-medium">
              <MapPin size={15} strokeWidth={2.4} /> {shop.zone}
            </span>
          </div>
        </div>

        {/* Categories */}
        {shop.menuCategories.length > 1 && (
          <div className="sticky top-0 z-20 bg-market-cream flex gap-2 overflow-x-auto py-3 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory overscroll-x-contain scroll-smooth">
            {shop.menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 min-h-11 rounded-full text-sm font-semibold transition-all snap-start scroll-ml-4 active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-market-brown text-white shadow-warm-sm'
                    : 'bg-white text-[#4A382A] border border-[#E9D7B5]/70 hover:bg-[#FAF7F0] active:bg-[#FAF7F0]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        <div className="space-y-3 pb-24">
          {products.filter((p) => !activeCategory || p.categoryId === activeCategory).length === 0 ? (
            <div className="text-center py-10">
              <UtensilsCrossed size={36} className="text-market-brown/30 mx-auto" />
              <p className="text-muted-foreground mt-2 text-sm">ไม่มีเมนูในหมวดนี้</p>
            </div>
          ) : (
            products
              .filter((p) => !activeCategory || p.categoryId === activeCategory)
              .map((product) => (
                <FoodCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  shopOpen={shop.isOpen}
                />
              ))
          )}
        </div>
      </div>
    </div>
  )
}
