'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { MarketHeader } from '@/components/market/MarketHeader'
import { getOrderRepository } from '@/lib/repositories'
import { Order } from '@/domain/order/order.model'
import { User, GraduationCap, Star, ShoppingBag, MapPin, PhoneCall, ChevronRight, Store, WalletCards, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/hooks'
import { setUser } from '@/store/slices/session.slice'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector((s) => s.session.user)
  const [orders, setOrders] = useState<Order[]>([])

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
  const points = Math.floor(totalSpent / 10)
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

      <div className="px-5 pt-5 space-y-4 pb-32">
        {/* Student Pass Card */}
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-market-brown to-[#8C6540] text-white shadow-warm-lg animate-reveal-on-scroll">
          {/* Background brand illustration watermark */}
          <img
            src="/images/feat-waves.png"
            alt=""
            className="absolute -right-6 -bottom-6 w-36 opacity-15 pointer-events-none select-none filter invert"
          />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner flex-shrink-0">
              <User size={30} className="text-white" />
            </div>
            <div className="min-w-0">
              <span className="inline-block text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/25">
                โปรไฟล์ทดลองตลาดริมชล
              </span>
              <h1 className="font-bold text-lg text-white mt-1 leading-tight truncate">
                {user?.email || 'ผู้ใช้งาน'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-white/80 text-xs">
                <GraduationCap size={13} />
                <span>รหัสนักศึกษา {user?.studentId || '-'}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-white/80 text-xs">
                <PhoneCall size={13} />
                <span>{user?.phone || '-'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90">
            <span>สถานะ: ผู้ใช้งานทดลอง</span>
            <span className="font-bold text-amber-200">ข้อมูลบนอุปกรณ์นี้</span>
          </div>
        </div>

        <button onClick={() => { dispatch(setUser(null)); router.replace('/auth') }} className="w-full h-11 rounded-xl border border-market-beige bg-white text-market-dark text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"><LogOut size={17} /> ออกจากระบบ</button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 animate-reveal-on-scroll">
          <div className="bg-white rounded-2xl p-4 shadow-warm-xs border border-[#E9D7B5]/60 text-center">
            <p className="font-black text-2xl text-market-brown">{orders.length}</p>
            <p className="text-xs text-[#8A7B6D] font-medium mt-0.5">ออเดอร์ทั้งหมด</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-warm-xs border border-[#E9D7B5]/60 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star size={18} className="text-market-orange" fill="currentColor" />
              <p className="font-black text-2xl text-market-brown">{points}</p>
            </div>
            <p className="text-xs text-[#8A7B6D] font-medium mt-0.5">แต้มทดลอง (ยังแลกไม่ได้)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-warm-xs border border-[#E9D7B5]/60 flex items-center justify-between animate-reveal-on-scroll">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><WalletCards size={19} /></div>
            <div><p className="text-xs text-[#8A7B6D] font-medium">ยอดใช้จ่ายจากออเดอร์ที่รับแล้ว</p><p className="font-black text-xl text-market-brown mt-0.5">฿{totalSpent}</p></div>
          </div>
          <span className="text-[11px] font-bold text-market-muted">{orders.filter((order) => order.status === 'completed').length} ออเดอร์</span>
        </div>

        {frequentShops.length > 0 && (
          <section className="animate-reveal-on-scroll">
            <div className="flex items-center justify-between mb-2 px-1"><h2 className="font-bold text-market-dark text-sm">ร้านที่คุณสั่งบ่อย</h2><Link href="/orders" className="text-xs font-bold text-market-brown">ดูออเดอร์</Link></div>
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
        <div className="bg-white rounded-3xl p-2 border border-[#E9D7B5]/60 shadow-warm-xs divide-y divide-[#E9D7B5]/30 animate-reveal-on-scroll">
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

        {/* Market Info Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#E9D7B5]/60 p-4 text-center shadow-warm-xs animate-reveal-on-scroll">
          <div className="w-8 h-8 rounded-full bg-[#FAF7F0] flex items-center justify-center mx-auto mb-2 border border-[#E9D7B5]/60">
            <img src="/images/feat-hut.png" alt="" className="w-5 h-5 object-contain" />
          </div>
          <p className="text-sm font-bold text-[#2E2318]">หลาดริมชล — แอปสั่งอาหารตลาดมหาวิทยาลัย</p>
          <p className="text-[#8A7B6D] text-xs mt-0.5">
            อร่อยริมน้ำ ไม่ต้องรอคิว สั่งล่วงหน้าได้ทันที
          </p>
          <p className="text-[#A67C52] text-xs font-semibold mt-2">เวอร์ชันทดลอง · ยังไม่เชื่อมต่อร้านค้า</p>
        </div>
      </div>
    </div>
  )
}
