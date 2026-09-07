'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { MarketHeader } from '@/components/market/MarketHeader'
import { getOrderRepository } from '@/lib/repositories'
import { Order } from '@/domain/order/order.model'
import { User, GraduationCap, Star, ShoppingBag, MapPin, PhoneCall, ChevronRight, Store, LogOut, Camera } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/hooks'
import { setUser } from '@/store/slices/session.slice'
import { useRouter } from 'next/navigation'
import { updateAvatar } from '@/lib/auth'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector((s) => s.session.user)
  const [orders, setOrders] = useState<Order[]>([])
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
    const load = async () => {
      if (!user) return
      const orderRepo = getOrderRepository()
      const data = await orderRepo.getOrders(user.id)
      setOrders(data)
    }
    load()
  }, [user])

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

      <div className="px-5 pt-6 space-y-6 pb-28">
        {/* Account hero */}
        <section className="py-2 text-center">
          <div className="relative mx-auto w-fit">
            <div className="relative w-24 h-24 rounded-full p-1 bg-white shadow-warm-xs">
              <div className="w-full h-full overflow-hidden rounded-full bg-white border-2 border-market-beige flex items-center justify-center text-market-brown">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="รูปโปรไฟล์" className="w-full h-full object-cover" /> : <User size={44} strokeWidth={1.8} />}
              </div>
              <button type="button" onClick={() => avatarInputRef.current?.click()} aria-label="เปลี่ยนรูปโปรไฟล์" className="absolute -right-2 -bottom-1 w-11 h-11 rounded-full bg-market-brown text-white border-4 border-market-cream flex items-center justify-center active:scale-95 transition-transform"><Camera size={17} strokeWidth={2} /></button>
              <input ref={avatarInputRef} type="file" accept="image/*" aria-label="เลือกรูปโปรไฟล์" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>
          <div className="relative mt-3">
            <h1 className="font-bold text-lg text-market-dark leading-tight truncate">{user?.phone || user?.name || user?.email || 'ผู้ใช้งาน'}</h1>
            <p className="mt-1 text-xs text-market-muted truncate">{user?.email || 'บัญชีผู้ใช้งาน'}</p>
          </div>
          {avatarError && <p role="alert" className="mt-2 text-center text-xs font-medium text-red-700">{avatarError}</p>}
        </section>

        <section aria-label="แต้มและการสั่งซื้อ" className="rounded-2xl border border-market-beige/60 bg-white p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-market-muted">แต้มสะสม</p><p className="mt-1 text-3xl font-bold text-market-brown tabular-nums">{points.toLocaleString('th-TH')} <span className="text-xs font-normal text-market-muted">แต้ม</span></p></div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-market-orange/10"><Star size={21} className="text-market-orange" fill="currentColor" /></span>
          </div>
          <p className="mt-2 text-[11px] text-market-muted">แต้มทดลอง ยังไม่สามารถแลกรางวัลได้</p>
          <div className="mt-5 grid grid-cols-2 divide-x divide-market-beige/50 border-t border-market-beige/50 pt-4">
            <div><p className="text-lg font-bold text-market-dark tabular-nums">{orders.length}</p><p className="mt-1 text-xs text-market-muted">ออเดอร์ทั้งหมด</p></div>
            <div className="pl-5"><p className="text-lg font-bold text-market-dark tabular-nums">฿{totalSpent.toLocaleString('th-TH')}</p><p className="mt-1 text-xs text-market-muted">ยอดจากออเดอร์ที่รับแล้ว</p></div>
          </div>
        </section>

        <details className="group rounded-2xl border border-market-beige/60 bg-white">
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <User size={20} className="text-market-brown" /><span className="flex-1 text-sm font-semibold text-market-dark">ข้อมูลส่วนตัว</span><ChevronRight size={18} className="text-market-muted transition-transform group-open:rotate-90" />
          </summary>
          <dl className="mx-4 space-y-4 border-t border-market-beige/50 py-4 text-sm">
            <div><dt className="flex items-center gap-2 text-xs text-market-muted"><GraduationCap size={15} />รหัสนักศึกษา</dt><dd className="mt-1 text-market-dark">{user?.studentId || 'ยังไม่ได้ระบุ'}</dd></div>
            <div><dt className="flex items-center gap-2 text-xs text-market-muted"><PhoneCall size={15} />เบอร์โทรศัพท์</dt><dd className="mt-1 text-market-dark">{user?.phone || 'ยังไม่ได้ระบุ'}</dd></div>
          </dl>
        </details>

        {frequentShops.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-market-dark text-sm">ร้านที่คุณสั่งบ่อย</h2><Link href="/orders" className="text-xs font-semibold text-market-brown">ดูออเดอร์</Link></div>
            <div className="space-y-2">
              {frequentShops.map((shop, index) => (
                <Link key={shop.id} href={`/shops/${shop.id}`} className="flex items-center justify-between bg-white border border-[#E9D7B5]/60 rounded-2xl p-3 shadow-warm-xs active:scale-[0.99] transition-transform">
                  <div className="flex items-center gap-3 min-w-0"><div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-market-brown flex items-center justify-center shrink-0"><Store size={18} /></div><div className="min-w-0"><p className="font-bold text-market-dark text-sm truncate">{shop.name}</p><p className="text-xs text-market-muted mt-0.5">สั่ง {shop.count} ครั้ง · ฿{shop.total}</p></div></div>
                  {index === 0 && <span className="text-[10px] font-bold bg-market-orange/15 text-market-brown px-2 py-1 rounded-lg">สั่งบ่อยสุด</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions List */}
        <div className="bg-white rounded-2xl p-2 border border-market-beige/60 divide-y divide-market-beige/40">
          <Link
            href="/orders"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF7F0] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-market-orange flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="font-bold text-[#2E2318] text-sm">ประวัติการสั่งซื้อ</p>
                <p className="text-xs text-[#8A7B6D]">ดูรายการอาหารที่เคยสั่ง</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#B3A497] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/shops"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF7F0] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-bold text-[#2E2318] text-sm">ร้านค้าทั้งหมด</p>
                <p className="text-xs text-[#8A7B6D]">โซน A, B, C, D ริมน้ำ</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#B3A497] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF7F0] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <PhoneCall size={18} />
              </div>
              <div>
                <p className="font-bold text-[#2E2318] text-sm">ติดต่อศูนย์ประสานงาน</p>
                <p className="text-xs text-[#8A7B6D]">ยังไม่ได้ตั้งค่าช่องทางติดต่อ</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-market-brown bg-[#FAF7F0] px-2 py-1 rounded-lg border border-[#E9D7B5]/60">
              เร็ว ๆ นี้
            </span>
          </div>
        </div>

        <button onClick={() => { dispatch(setUser(null)); router.replace('/auth') }} className="w-full min-h-12 rounded-2xl border border-market-beige/70 text-market-brown text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white active:scale-[0.99] transition-all"><LogOut size={18} />ออกจากระบบ</button>
        <footer className="text-center text-[11px] leading-relaxed text-market-muted">
          <p>หลาดริมชล · บัญชีและรูปโปรไฟล์เก็บบนอุปกรณ์นี้</p>
          <p className="mt-1">เวอร์ชันทดลอง · ยังไม่เชื่อมต่อร้านค้า</p>
        </footer>
      </div>
    </div>
  )
}
