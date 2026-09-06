import { Shop } from '@/domain/shop/shop.model'
import { Product } from '@/domain/product/product.model'
import Link from 'next/link'
import { Star, Clock, Plus, Store, UtensilsCrossed, ChevronRight } from 'lucide-react'

const SHOP_IMAGES: Record<string, string> = {
  noodle: '/images/stalls/noodle.webp',
  rice: '/images/stalls/krapal.webp',
  thai: '/images/stalls/padthai.webp',
  seafood: '/images/stalls/seafood.webp',
  international: '/images/stalls/sushi.webp',
  sushi: '/images/stalls/sushi.webp',
  pizza: '/images/stalls/pizza.webp',
  dessert: '/images/stalls/cake.webp',
  drink: '/images/stalls/cake.webp',
  snack: '/images/stalls/pizza.webp',
  isaan: '/images/stalls/seafood.webp',
  default: '/images/stalls/krapal.webp'
}

interface ShopCardProps {
  shop: Shop
  variant?: 'default' | 'compact' | 'featured' | 'stall'
  previewProducts?: Product[]
  onAddToCart?: (product: Product, shop: Shop) => void
}

export function ShopCard({
  shop,
  variant = 'default',
  previewProducts,
  onAddToCart,
}: ShopCardProps) {
  const imageUrl = shop.coverUrl || shop.imageUrl || SHOP_IMAGES[shop.category] || SHOP_IMAGES.default

  if (variant === 'featured' || variant === 'stall') {
    return (
      <div className="bg-white rounded-[24px] overflow-hidden shadow-warm-xs border border-[#E9D7B5]/60 transition-all duration-200 hover:shadow-warm-sm">
        {/* Storefront / Stall Photo Header */}
        <Link href={`/shops/${shop.id}`} className="block relative group active:scale-[0.985] transition-transform duration-150">
          <div className="h-44 sm:h-48 bg-gray-100 relative overflow-hidden">
            <img
              src={imageUrl}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = SHOP_IMAGES.default
              }}
            />

            {/* Top Stall Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="bg-[#2E2318]/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Store size={14} strokeWidth={2.4} className="text-market-orange" />
                {shop.zone}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              {shop.isOpen ? (
                <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  เปิดอยู่
                </span>
              ) : (
                <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  ปิด
                </span>
              )}
            </div>

            {/* Bottom Gradient overlay with shop title */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#2E2318]/85 to-transparent flex items-end p-3.5">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-[18px] leading-tight drop-shadow-sm truncate">
                  {shop.name}
                </h3>
              </div>
            </div>
          </div>
        </Link>

        {/* Stall Meta Bar */}
        <div className="px-4 py-2.5 bg-[#FAF7F0] border-b border-[#E9D7B5]/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-[#2E2318]">
              <Star size={14} strokeWidth={2.4} className="text-amber-500 fill-amber-500" />
              {shop.rating}
              <span className="text-[#8A7B6D] font-normal">({shop.reviewCount})</span>
            </span>
            <span className="text-[#D4C3A3]">•</span>
            <span className="flex items-center gap-1 text-[#6B5A4B] font-medium">
              <Clock size={13} strokeWidth={2.4} />
              {shop.preparationTime}-{shop.preparationTime + 5} นาที
            </span>
          </div>
          <Link
            href={`/shops/${shop.id}`}
            className="text-[#A67C52] font-semibold text-[11px] hover:text-[#8C6540] flex items-center gap-0.5"
          >
            ดูหน้าร้าน <ChevronRight size={14} strokeWidth={2.6} />
          </Link>
        </div>

        {/* Food List Preview ("show list preview อาหาร") */}
        {previewProducts && previewProducts.length > 0 && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#8A7B6D] tracking-wide uppercase flex items-center gap-1.5">
                <UtensilsCrossed size={14} strokeWidth={2.4} className="text-market-orange" /> เมนูแนะนำของร้าน
              </span>
            </div>
            <div className="space-y-2">
              {previewProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E9D7B5]/30 transition-colors group/item"
                >
                  <Link
                    href={`/menu/${product.id}`}
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-2xs">
                      <img
                        src={product.imageUrl || '/images/food/default.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/food/default.jpg'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2E2318] text-[13px] truncate group-hover/item:text-market-brown transition-colors">
                        {product.name}
                      </p>
                      <p className="font-black text-[#A67C52] text-[13px] mt-0.5">
                        ฿{product.price}
                      </p>
                    </div>
                  </Link>

                  {onAddToCart && product.isAvailable && product.stock !== 0 && shop.isOpen && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        onAddToCart(product, shop)
                      }}
                      className="flex items-center justify-center w-11 h-11 rounded-full bg-market-orange text-white hover:bg-[#E8894E] active:scale-90 shadow-xs transition-transform flex-shrink-0 ml-2"
                      aria-label={`เลือก ${product.name}`}
                    >
                      <Plus size={16} strokeWidth={2.8} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/shops/${shop.id}`} className="block group active:scale-[0.985] transition-transform duration-150">
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl shadow-warm-xs hover:shadow-warm-sm transition-all duration-200 border border-[#E9D7B5]/40">
          <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-gray-100 overflow-hidden relative">
            <img
              src={imageUrl}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = SHOP_IMAGES.default
              }}
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 text-[15px] truncate group-hover:text-market-brown transition-colors">{shop.name}</h3>
              {!shop.isOpen && (
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm flex-shrink-0 font-medium">ปิด</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-market-orange">
                <Star size={11} fill="currentColor" /> {shop.rating}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                <Clock size={11} /> {shop.preparationTime} นาที
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/shops/${shop.id}`} className="block group active:scale-[0.985] transition-transform duration-150">
      <div
        className={`relative rounded-3xl overflow-hidden bg-white shadow-warm-xs border border-gray-100 hover:shadow-warm-sm transition-all duration-300 ${
          !shop.isOpen ? 'opacity-70 grayscale-[30%]' : ''
        }`}
      >
        {/* Cover */}
        <div className="h-[135px] bg-gray-100 relative overflow-hidden">
          <img
            src={imageUrl}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = SHOP_IMAGES.default
            }}
          />

          {!shop.isOpen && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                ปิดให้บริการ
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="font-bold text-gray-900 text-[15px] truncate group-hover:text-market-brown transition-colors">
            {shop.name}
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[12px] font-bold text-market-orange">
              <Star size={12} fill="currentColor" /> {shop.rating}
            </span>
            <span className="text-gray-300 text-[10px]">•</span>
            <span className="flex items-center gap-1 text-[12px] text-gray-500 font-medium">
              <Clock size={12} /> {shop.preparationTime}-{shop.preparationTime + 5} นาที
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
