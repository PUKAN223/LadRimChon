import { Product } from '@/domain/product/product.model'
import Link from 'next/link'
import { Plus, Flame, Star } from 'lucide-react'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { FavoriteButton } from '@/components/ui/favorite-button'

const FOOD_IMAGES: Record<string, string> = {
  ชา: '/images/food/drink.jpg',
  กาแฟ: '/images/food/drink.jpg',
  น้ำ: '/images/food/drink.jpg',
  ส้มตำ: '/images/food/isaan.jpg',
  ลาบ: '/images/food/isaan.jpg',
  ก๋วย: '/images/mockup-noodle-shop.png',
  ต้มยำ: '/images/mockup-noodle-shop.png',
  เส้น: '/images/food/noodle.jpg',
  ผัดไทย: '/images/food/noodle.jpg',
  ผัด: '/images/food/rice.jpg',
  ข้าว: '/images/food/rice.jpg',
  แกง: '/images/food/rice.jpg',
  หมู: '/images/food/rice.jpg',
  ขนม: '/images/food/dessert.jpg',
  ของหวาน: '/images/food/dessert.jpg',
  default: '/images/food/default.jpg'
}

function getFoodImage(name: string): string {
  for (const [key, image] of Object.entries(FOOD_IMAGES)) {
    if (name.includes(key)) return image
  }
  return FOOD_IMAGES.default
}

interface FoodCardProps {
  product: Product
  onAddToCart?: () => void
  shopOpen?: boolean
}

export function FoodCard({ product, onAddToCart, shopOpen = true }: FoodCardProps) {
  const isBestseller = product.tags.includes('bestseller')
  const isPopular = product.tags.includes('popular')
  const imageUrl = (product.imageUrl && product.imageUrl.startsWith('/images/'))
    ? product.imageUrl
    : getFoodImage(product.name)

  return (
    <div className="group flex gap-2.5 p-2.5 bg-white rounded-2xl border border-[#E9D7B5]/40 shadow-warm-xs hover:shadow-warm-sm transition-all duration-200">
      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Badges & Favorite */}
          <div className="flex items-center justify-between gap-1 mb-1 min-h-[22px]">
            <div className="flex items-center gap-1">
              {isBestseller && (
                <span className="inline-flex items-center gap-1 text-[9px] bg-orange-50 text-orange-600 font-bold px-1.5 py-0.5 rounded-md">
                  <Flame size={11} strokeWidth={2.4} className="fill-orange-600 text-orange-600" /> ขายดี
                </span>
              )}
              {isPopular && (
                <span className="inline-flex items-center gap-1 text-[9px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
                  <Star size={11} strokeWidth={2.4} className="fill-green-700 text-green-700" /> ยอดนิยม
                </span>
              )}
            </div>
            <FavoriteButton type="product" id={product.id} name={product.name} variant="subtle" size={16} />
          </div>

          <Link href={`/menu/${product.id}`}>
            <h3 className="font-bold text-[#2E2318] text-[14px] leading-snug group-hover:text-market-brown transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-[#8A7B6D] mt-0.5 line-clamp-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="font-black text-[#A67C52] text-[15px]">฿{product.price}</span>

          {product.isAvailable && product.stock !== 0 && shopOpen ? (
            <button
              onClick={onAddToCart}
              id={`add-to-cart-${product.id}`}
              className="flex items-center justify-center w-10 h-10 bg-market-orange text-white rounded-full shadow-warm-xs hover:bg-[#E8894E] active:scale-90 transition-transform"
              aria-label={`เลือก ${product.name}`}
            >
              <Plus size={17} strokeWidth={2.8} />
            </button>
          ) : (
            <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md font-medium border border-gray-100">
              {shopOpen ? 'หมด' : 'ร้านปิด'}
            </span>
          )}
        </div>
      </div>

      {/* Image */}
      <Link href={`/menu/${product.id}`} className="flex-shrink-0 self-center">
        <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden relative shadow-xs">
          <ImageWithSkeleton
            wrapperClassName="absolute inset-0"
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackSrc={FOOD_IMAGES.default}
          />
        </div>
      </Link>
    </div>
  )
}
