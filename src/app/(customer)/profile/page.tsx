'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { MarketHeader } from '@/components/market/MarketHeader'
import { getOrderRepository, getProductRepository, getShopRepository } from '@/lib/repositories'
import { Order } from '@/domain/order/order.model'
import { Shop } from '@/domain/shop/shop.model'
import { Product } from '@/domain/product/product.model'
import {
  User,
  GraduationCap,
  ShoppingBag,
  MapPin,
  PhoneCall,
  ChevronRight,
  Store,
  LogOut,
  Camera,
  Heart,
  Ticket,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { setUser } from '@/store/slices/session.slice'
import { selectFavoriteShopIds, selectFavoriteProductIds } from '@/store/slices/favorites.slice'
import { selectActiveUserVouchers } from '@/store/slices/voucher.slice'
import { VoucherModal } from '@/components/voucher/VoucherModal'
import { ShopCard } from '@/components/shop/ShopCard'
import { FoodCard } from '@/components/food/FoodCard'
import { useRouter } from 'next/navigation'
import { updateAvatar } from '@/lib/auth'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector((s) => s.session.user)
  const favoriteShopIds = useAppSelector(selectFavoriteShopIds)
  const favoriteProductIds = useAppSelector(selectFavoriteProductIds)
  const activeVouchers = useAppSelector(selectActiveUserVouchers)

  const [orders, setOrders] = useState<Order[]>([])
  const [favShops, setFavShops] = useState<Shop[]>([])
  const [favProducts, setFavProducts] = useState<Product[]>([])
  const [favoritesTab, setFavoritesTab] = useState<'shops' | 'products'>('shops')
  const [voucherModalOpen, setVoucherModalOpen] = useState(false)
  const [voucherModalTab, setVoucherModalTab] = useState<'my-vouchers' | 'exchange'>('my-vouchers')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarError, setAvatarError] = useState('')

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !user) return
    if (!file.type.startsWith('image/')) { setAvatarError('กรุณาเลือกรูปภาพ'); return }
    if (file.size > 2 * 1024 * 1024) { setAvatarError('รูปต้องมีขนาดไม่เกิน 2 MB'); return }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      try {
        dispatch(setUser(updateAvatar(user.id, reader.result)))
        setAvatarError('')
      } catch (error) { setAvatarError(error instanceof Error ? error.message : 'เปลี่ยนรูปไม่สำเร็จ') }
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return
      const orderRepo = getOrderRepository()
      const data = await orderRepo.getOrders(user.id)
      setOrders(data)
    }
    loadOrders()
  }, [user])

  useEffect(() => {
    const loadFavorites = async () => {
      const shopRepo = getShopRepository()
      const productRepo = getProductRepository()

      const shops = await Promise.all(favoriteShopIds.map((id) => shopRepo.getShop(id)))
      setFavShops(shops.filter((s): s is Shop => s !== null))

      const products = await Promise.all(favoriteProductIds.map((id) => productRepo.getProduct(id)))
      setFavProducts(products.filter((p): p is Product => p !== null))
    }
    loadFavorites()
  }, [favoriteShopIds, favoriteProductIds])

  const totalSpent = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0)
  const points = user?.points ?? 0
  const frequentShops = useMemo(() => Object.values(orders.reduce<Record<string, { id: string; name: string; count: number; total: number }>>((shops, order) => {
    const shop = shops[order.shopId] || { id: order.shopId, name: order.shopName, count: 0, total: 0 }
    shop.count += 1
    shop.total += order.totalPrice
    shops[order.shopId] = shop
    return shops
  }, {})).sort((a, b) => b.count - a.count || b.total - a.total).slice(0, 3), [orders])

  return (
    <div className="animate-fade-in bg-[#F7F3E8] min-h-screen">
      <MarketHeader title="โปรไฟล์ของฉัน" showCart={false} />

      <div className="px-5 pt-4 space-y-4 pb-28">
        {/* Profile Identity Card */}
        <section className="pt-2 pb-1 text-center">
          <div className="relative mx-auto w-fit">
            <div className="relative w-22 h-22 rounded-full p-1 bg-white shadow-xs">
              <div className="w-full h-full overflow-hidden rounded-full bg-[#FAF7F0] border-2 border-market-beige/60 flex items-center justify-center text-market-brown">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="รูปโปรไฟล์" className="w-full h-full object-cover" />
                ) : (
                  <User size={38} strokeWidth={1.8} />
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="เปลี่ยนรูปโปรไฟล์"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-market-brown hover:bg-[#8C6540] text-white border-2 border-white shadow-xs flex items-center justify-center active:scale-95 transition-all"
              >
                <Camera size={14} strokeWidth={2.2} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                aria-label="เลือกรูปโปรไฟล์"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="mt-2.5">
            <h1 className="font-bold text-lg text-market-dark leading-tight">
              {user?.name || user?.phone || 'ผู้ใช้งาน'}
            </h1>
            <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
              {user?.studentId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-market-beige/60 text-[11px] font-medium text-market-brown">
                  <GraduationCap size={12} /> {user.studentId}
                </span>
              )}
              <span className="text-xs text-market-muted">
                {user?.phone || user?.email || 'บัญชีผู้ใช้งาน'}
              </span>
            </div>
          </div>

          {avatarError && (
            <p role="alert" className="mt-2 text-center text-xs font-medium text-red-600 bg-red-50 py-1 px-3 rounded-lg w-fit mx-auto">
              {avatarError}
            </p>
          )}
        </section>

        {/* Loyalty Points & Summary */}
        <section aria-label="แต้มและการสั่งซื้อ" className="bg-white rounded-2xl border border-market-beige/60 p-4 shadow-warm-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div>
                <p className="text-[11px] text-market-muted font-medium">แต้มสะสมริมชล</p>
                <p className="text-2xl font-black text-market-brown tabular-nums leading-none mt-0.5">
                  {points.toLocaleString('th-TH')}{' '}
                  <span className="text-xs font-normal text-market-muted">แต้ม</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setVoucherModalTab('exchange')
                  setVoucherModalOpen(true)
                }}
                className="py-2 px-2.5 bg-market-orange text-white rounded-xl font-bold text-xs shadow-xs hover:bg-[#E8894E] active:scale-95 transition-all flex items-center gap-1"
              >
                แลกคูปอง
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoucherModalTab('my-vouchers')
                  setVoucherModalOpen(true)
                }}
                className="py-2 px-2.5 bg-[#FAF7F0] text-market-brown border border-[#E9D7B5]/80 rounded-xl font-bold text-xs hover:bg-[#F2ECE1] active:scale-95 transition-all flex items-center gap-1"
              >
                <Ticket size={13} />
                คูปอง ({activeVouchers.length})
              </button>
            </div>
          </div>

          {/* Quick order stats bar */}
          <div className="grid grid-cols-2 divide-x divide-market-beige/40 border-t border-market-beige/40 pt-3">
            <Link href="/orders" className="text-center hover:opacity-80 transition-opacity">
              <p className="text-base font-bold text-market-dark tabular-nums">{orders.length}</p>
              <p className="text-[11px] text-market-muted">ออเดอร์ทั้งหมด →</p>
            </Link>
            <div className="text-center">
              <p className="text-base font-bold text-market-dark tabular-nums">฿{totalSpent.toLocaleString('th-TH')}</p>
              <p className="text-[11px] text-market-muted">ยอดที่สำเร็จแล้ว</p>
            </div>
          </div>
        </section>

        {/* Favorites & Wishlist Section */}
        <section className="bg-white rounded-2xl border border-market-beige/60 p-4 shadow-warm-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-market-dark text-sm">รายการโปรด</h2>
            </div>

            {/* Modern Pill Switcher */}
            <div className="flex bg-[#FAF7F0] p-0.5 rounded-lg border border-[#E9D7B5]/50 gap-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFavoritesTab('shops')}
                className={`px-2.5 py-1 rounded-md transition-all ${favoritesTab === 'shops'
                  ? 'bg-white text-market-dark shadow-2xs font-bold'
                  : 'text-market-muted hover:text-market-dark'
                  }`}
              >
                ร้านค้า ({favShops.length})
              </button>
              <button
                type="button"
                onClick={() => setFavoritesTab('products')}
                className={`px-2.5 py-1 rounded-md transition-all ${favoritesTab === 'products'
                  ? 'bg-white text-market-dark shadow-2xs font-bold'
                  : 'text-market-muted hover:text-market-dark'
                  }`}
              >
                เมนู ({favProducts.length})
              </button>
            </div>
          </div>

          {favoritesTab === 'shops' ? (
            favShops.length === 0 ? (
              <div className="text-center py-4 px-3 rounded-xl bg-[#FAF7F0]/40 border border-dashed border-[#E9D7B5]/70">
                <Store size={22} className="mx-auto text-market-muted/60 mb-1" />
                <p className="text-xs font-medium text-market-muted">ยังไม่มีร้านโปรด</p>
                <Link href="/shops" className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-bold text-market-orange hover:underline">
                  ค้นหาร้านอาหาร <ChevronRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {favShops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} variant="compact" />
                ))}
              </div>
            )
          ) : (
            favProducts.length === 0 ? (
              <div className="text-center py-4 px-3 rounded-xl bg-[#FAF7F0]/40 border border-dashed border-[#E9D7B5]/70">
                <UtensilsCrossed size={22} className="mx-auto text-market-muted/60 mb-1" />
                <p className="text-xs font-medium text-market-muted">ยังไม่มีเมนูโปรด</p>
                <Link href="/shops" className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-bold text-market-orange hover:underline">
                  เลือกดูเมนูอร่อย <ChevronRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {favProducts.map((product) => (
                  <FoodCard key={product.id} product={product} />
                ))}
              </div>
            )
          )}
        </section>

        {/* Frequent Shops (if any) */}
        {frequentShops.length > 0 && (
          <section className="bg-white rounded-2xl border border-market-beige/60 p-4 shadow-warm-xs">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-bold text-market-dark text-sm">ร้านที่คุณสั่งบ่อย</h2>
              <Link href="/orders" className="text-xs font-medium text-market-brown hover:underline">
                ดูประวัติ
              </Link>
            </div>
            <div className="space-y-1.5">
              {frequentShops.map((shop, index) => (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF7F0] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-market-brown flex items-center justify-center shrink-0">
                      <Store size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-market-dark text-sm truncate">{shop.name}</p>
                      <p className="text-[11px] text-market-muted">สั่ง {shop.count} ครั้ง · ฿{shop.total}</p>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-[10px] font-bold bg-market-orange/15 text-market-brown px-2 py-0.5 rounded-md">
                      บ่อยสุด
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Account & Navigation Group */}
        <div className="bg-white rounded-2xl border border-market-beige/60 divide-y divide-market-beige/40 shadow-warm-xs overflow-hidden">
          {/* Personal Info Row */}
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between p-3.5 hover:bg-[#FAF7F0]/60 transition-colors [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-market-cream text-market-brown flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-sm font-semibold text-market-dark">ข้อมูลส่วนตัว</span>
              </div>
              <ChevronRight size={16} className="text-market-muted transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-4 pb-3 pt-1 space-y-2 text-xs bg-[#FAF7F0]/30 border-t border-market-beige/30">
              <div className="flex justify-between py-1 border-b border-market-beige/30">
                <span className="text-market-muted flex items-center gap-1.5"><GraduationCap size={13} /> รหัสนักศึกษา</span>
                <span className="font-semibold text-market-dark">{user?.studentId || 'ยังไม่ได้ระบุ'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-market-muted flex items-center gap-1.5"><PhoneCall size={13} /> เบอร์โทรศัพท์</span>
                <span className="font-semibold text-market-dark">{user?.phone || 'ยังไม่ได้ระบุ'}</span>
              </div>
            </div>
          </details>

          <Link
            href="/orders"
            className="flex items-center justify-between p-3.5 hover:bg-[#FAF7F0]/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-market-orange flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <span className="text-sm font-semibold text-market-dark">ประวัติคำสั่งซื้อ</span>
            </div>
            <div className="flex items-center gap-1 text-market-muted">
              <span className="text-xs">{orders.length} รายการ</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/shops"
            className="flex items-center justify-between p-3.5 hover:bg-[#FAF7F0]/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPin size={16} />
              </div>
              <span className="text-sm font-semibold text-market-dark">ร้านค้าทั้งหมดริมชล</span>
            </div>
            <ChevronRight size={16} className="text-market-muted group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="flex items-center justify-between p-3.5 opacity-75">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <PhoneCall size={16} />
              </div>
              <span className="text-sm font-semibold text-market-dark">ติดต่อศูนย์ประสานงาน</span>
            </div>
            <span className="text-[10px] font-bold text-market-muted bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-market-beige/50">
              เร็ว ๆ นี้
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => {
            dispatch(setUser(null))
            router.replace('/auth')
          }}
          className="w-full py-3 rounded-2xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 text-rose-700 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
        >
          <LogOut size={16} /> ออกจากระบบ
        </button>

        <footer className="text-center text-[11px] text-market-muted/80 pt-1">
          <p>หลาดริมชล (LadRimChon) · ข้อมูลจำลองบนอุปกรณ์นี้</p>
        </footer>
      </div>

      {/* Voucher Modal */}
      <VoucherModal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        initialTab={voucherModalTab}
      />
    </div>
  )
}
