'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { getOrderRepository } from '@/lib/repositories'
import { Order } from '@/domain/order/order.model'
import { OrderStatusBadge } from '@/components/order/OrderStatus'
import { MarketHeader } from '@/components/market/MarketHeader'
import Link from 'next/link'
import { CalendarDays, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

function OrderCard({ order, formatDate, onReorder }: { order: Order; formatDate: (iso: string) => string; onReorder: (order: Order, event: React.MouseEvent) => void }) {
  const isActive = order.status !== 'completed' && order.status !== 'cancelled'
  return (
    <Link href={`/orders/${order.id}`} className="block animate-reveal-on-scroll content-auto">
      <div className={`bg-white rounded-2xl p-4 shadow-warm-xs hover:shadow-warm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] border ${isActive ? 'border-market-orange/70 ring-2 ring-market-orange/15' : 'border-[#E9D7B5]/50'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-bold text-[#2E2318] text-[15px]">#{order.orderNumber}</span><span className="text-xs text-muted-foreground">·</span><span className="text-xs font-semibold text-[#8A7B6D] truncate">{order.shopName}</span></div><p className="text-xs text-[#8A7B6D] mt-1 font-medium">{order.items.length} รายการ · <span className="font-bold text-market-brown">฿{order.totalPrice}</span></p><p className="text-[11px] text-[#A67C52] mt-0.5">{formatDate(order.createdAt)}</p></div>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#E9D7B5]/30">
          <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">{order.items.slice(0, 2).map((item) => <span key={item.id} className="text-[11px] font-medium bg-[#FAF7F0] text-[#6B5A4B] px-2 py-0.5 rounded-lg border border-[#E9D7B5]/40 truncate max-w-[140px]">{item.productName}</span>)}{order.items.length > 2 && <span className="text-[10px] text-muted-foreground">+{order.items.length - 2} อื่นๆ</span>}</div>
          {order.status === 'completed' && <button onClick={(event) => onReorder(order, event)} className="flex items-center gap-1 text-[11px] font-bold text-market-orange hover:text-[#E8894E] px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors flex-shrink-0"><RotateCcw size={12} /><span>สั่งอีกครั้ง</span></button>}
        </div>
      </div>
    </Link>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const user = useAppSelector((s) => s.session.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      const orderRepo = getOrderRepository()
      const data = await orderRepo.getOrders(user.id)
      setOrders(data)
      setLoading(false)
    }
    load()
  }, [user])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleReorder = (order: Order, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Reopen the current menu; historical prices/options may no longer be available.
    router.push(`/shops/${order.shopId}`)
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') {
      return order.status !== 'completed' && order.status !== 'cancelled'
    }
    if (activeTab === 'completed') {
      return order.status === 'completed'
    }
    return true
  })

  const orderGroups = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA')
    return filteredOrders.reduce<{ key: string; label: string; orders: Order[] }[]>((groups, order) => {
      const date = new Date(order.createdAt)
      const key = date.toLocaleDateString('en-CA')
      const label = key === today ? 'วันนี้' : date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
      const existing = groups.find((group) => group.key === key)
      if (existing) existing.orders.push(order)
      else groups.push({ key, label, orders: [order] })
      return groups
    }, [])
  }, [filteredOrders])

  return (
    <div className="animate-fade-in bg-[#F7F3E8] min-h-screen">
      <MarketHeader title="ออเดอร์ของฉัน" showCart={false} />

      {/* Tabs */}
      <div className="px-4 pt-3 animate-reveal-on-scroll">
        <div className="flex bg-white/70 p-1 rounded-2xl border border-[#E9D7B5]/60">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-market-brown text-white shadow-xs'
                : 'text-[#8A7B6D] hover:text-[#2E2318]'
            }`}
          >
            ทั้งหมด ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'active'
                ? 'bg-market-brown text-white shadow-xs'
                : 'text-[#8A7B6D] hover:text-[#2E2318]'
            }`}
          >
            กำลังทำ ({orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'completed'
                ? 'bg-market-brown text-white shadow-xs'
                : 'text-[#8A7B6D] hover:text-[#2E2318]'
            }`}
          >
            รับแล้ว ({orders.filter((o) => o.status === 'completed').length})
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3 pb-32">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-market-beige/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <img src="/images/empty-orders-student.png" alt="นักศึกษากำลังดูรายการอาหาร" className="h-40 w-44 object-contain animate-bounce-in" />
            <div className="text-center">
              <p className="font-bold text-[#2E2318] text-base">ไม่มีออเดอร์ในหมวดนี้</p>
              <p className="text-market-muted text-xs mt-1">เลือกสั่งอาหารจากซุ้มริมน้ำได้เลย</p>
            </div>
            <Link
              href="/"
              className="bg-market-orange text-white font-bold text-sm px-6 py-2.5 rounded-2xl shadow-warm hover:bg-[#E8894E] transition-all"
            >
              เลือกร้านอาหาร
            </Link>
          </div>
        ) : (
          orderGroups.map((group) => (
            <section key={group.key} className="space-y-3">
              <div className="flex items-center gap-2 px-1 text-xs font-bold text-market-muted"><CalendarDays size={14} className="text-market-brown" />{group.label}<span className="font-medium">{group.orders.length} ออเดอร์</span></div>
              {group.orders.map((order) => <OrderCard key={order.id} order={order} formatDate={formatDate} onReorder={handleReorder} />)}
            </section>
          ))
        )}
      </div>
    </div>
  )
}
