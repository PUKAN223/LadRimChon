'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Shop } from '@/domain/shop/shop.model'
import { Product } from '@/domain/product/product.model'
import { getShopRepository, getProductRepository } from '@/lib/repositories'
import { SEED_SHOPS, SEED_PRODUCTS } from '@/repositories/adapters/local-storage/seed.data'
import { ShopCard } from '@/components/shop/ShopCard'
import { MarketHeader } from '@/components/market/MarketHeader'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'noodle', label: 'ก๋วยเตี๋ยว' },
  { id: 'rice', label: 'อาหารจานเดียว' },
  { id: 'thai', label: 'ผัดไทย/หอยทอด' },
  { id: 'seafood', label: 'ซีฟู้ด/ทะเลเผา' },
  { id: 'international', label: 'นานาชาติ/ซูชิ/พิซซ่า' },
  { id: 'dessert', label: 'ของหวาน/คาเฟ่' },
]

const initialShopProducts: Record<string, Product[]> = {}
SEED_SHOPS.forEach((s) => {
  initialShopProducts[s.id] = SEED_PRODUCTS.filter((p) => p.shopId === s.id)
})

export default function ShopsPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>(SEED_SHOPS)
  const [shopProducts, setShopProducts] = useState<Record<string, Product[]>>(initialShopProducts)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const shopRepo = getShopRepository()
        const productRepo = getProductRepository()

        const allShops = await shopRepo.getShops().catch(() => SEED_SHOPS)
        const validShops = allShops && allShops.length > 0 ? allShops : SEED_SHOPS
        setShops(validShops)

        const prodMap: Record<string, Product[]> = {}
        await Promise.all(
          validShops.map(async (shop: Shop) => {
            try {
              const prods = await productRepo.getProducts(shop.id)
              prodMap[shop.id] = prods && prods.length > 0 ? prods : SEED_PRODUCTS.filter(p => p.shopId === shop.id)
            } catch {
              prodMap[shop.id] = SEED_PRODUCTS.filter(p => p.shopId === shop.id)
            }
          })
        )
        setShopProducts(prodMap)
      } catch (err) {
        console.error('Error loading shops:', err)
        setShops(SEED_SHOPS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAddToCart = (product: Product, shop: Shop) => {
    if (!shop.isOpen || !product.isAvailable || product.stock === 0) return
    router.push(`/menu/${product.id}`)
  }

  const deferredSearch = useDeferredValue(search)
  const filteredShops = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    return shops.filter((shop) => {
      const matchesCategory = selectedCategory === 'all' || shop.category === selectedCategory
      const matchesSearch = [shop.name, shop.zone, String(shop.shopNumber ?? ''), shop.description, ...shop.tags,
        ...(shopProducts[shop.id] ?? []).map((product) => product.name)]
        .some((text) => text.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [deferredSearch, selectedCategory, shopProducts, shops])

  return (
    <div className="animate-fade-in pb-28 bg-[#F7F3E8] min-h-screen">
      <MarketHeader showBack backHref="/" title="ร้านค้า" showCart={false} />


      {/* Search & Category Filter Bar */}
      <div className="px-5 pt-6 space-y-4">
        <div className="relative">
          <Search size={20} strokeWidth={2.6} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A382A]" />
          <input
            type="search"
            aria-label="ค้นหาร้านหรือเมนู"
            placeholder="ค้นหาชื่อร้าน หรือหมายเลขร้าน เช่น ร้านที่ 1..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white rounded-2xl text-[14px] text-[#2E2318] placeholder:text-[#8A7B6D] focus:outline-none shadow-warm-xs border border-[#E9D7B5]/70 focus:border-market-brown/70 transition-all font-medium"
          />
          {search && (
            <button
              aria-label="ล้างคำค้นหา"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-[#FAF7F0] text-[#4A382A] hover:bg-gray-200 text-xs"
            >
              <X size={14} strokeWidth={2.8} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory overscroll-x-contain scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all snap-start scroll-ml-5 active:scale-95 ${
                  isActive
                    ? 'bg-market-brown text-white shadow-warm-xs'
                    : 'bg-white text-[#4A382A] border border-[#E9D7B5]/70 hover:border-market-brown/40 active:bg-[#FAF7F0]'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stall Cards List */}
      <div className="px-5 mt-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-[#8A7B6D] font-medium">
          <span>พบ {filteredShops.length} ร้าน</span>
          <span>เปิดบริการ 10:00 - 20:00 น.</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] overflow-hidden shadow-warm-xs border border-[#E9D7B5]/60"
              >
                <div className="h-44 sm:h-48 skeleton-shimmer" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-44 rounded-md skeleton-shimmer" />
                    <div className="h-4 w-12 rounded-md skeleton-shimmer" />
                  </div>
                  <div className="h-3.5 w-3/4 rounded-md skeleton-shimmer" />
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#FAF7F0]">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="space-y-1.5">
                        <div className="w-full aspect-square rounded-xl skeleton-shimmer" />
                        <div className="h-3 w-full rounded-md skeleton-shimmer" />
                        <div className="h-3 w-10 rounded-md skeleton-shimmer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#E9D7B5]/50 shadow-warm-xs p-6">
            <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <img
                src="/images/feat-food.png"
                alt="ไม่พบร้าน"
                className="w-full h-full object-contain opacity-70"
              />
            </div>
            <p className="text-[#2E2318] font-bold text-base">ไม่พบร้านค้าที่ค้นหา</p>
            <p className="text-market-muted text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="content-auto"
            >
              <ShopCard
                shop={shop}
                variant="stall"
                previewProducts={shopProducts[shop.id]}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
