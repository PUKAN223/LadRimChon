'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Order } from '@/domain/order/order.model'
import { getOrderRepository } from '@/lib/repositories'
import { OrderStatusBadge, OrderStatusTracker } from '@/components/order/OrderStatus'
import { MarketHeader } from '@/components/market/MarketHeader'
import { Store, MapPin, KeyRound, Sparkles, SlidersHorizontal, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_SEQUENCE: Order['status'][] = ['pending', 'accepted', 'preparing', 'ready', 'completed']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [advancing, setAdvancing] = useState(false)

  const loadOrder = useCallback(async () => {
    try {
      const data = await getOrderRepository().getOrder(id)
      setOrder(data)
      setError('')
    } catch { setError('โหลดออเดอร์ไม่สำเร็จ กรุณาลองใหม่') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => {
    let active = true
    getOrderRepository().getOrder(id).then((data) => {
      if (active) { setOrder(data); setLoading(false) }
    }).catch(() => {
      if (active) { setError('โหลดออเดอร์ไม่สำเร็จ กรุณาลองใหม่'); setLoading(false) }
    })
    const interval = setInterval(loadOrder, 3000)
    return () => { active = false; clearInterval(interval) }
  }, [id, loadOrder])

  const handleAdvanceStatus = async () => {
    if (!order || advancing || process.env.NODE_ENV === 'production') return
    const currentIndex = STATUS_SEQUENCE.indexOf(order.status)
    if (currentIndex >= 0 && currentIndex < STATUS_SEQUENCE.length - 1) {
      setAdvancing(true)
      try {
      const nextStatus = STATUS_SEQUENCE[currentIndex + 1]
      const orderRepo = getOrderRepository()
      await orderRepo.updateOrderStatus(order.id, nextStatus)
      await loadOrder()
      } catch { setError('อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่') }
      finally { setAdvancing(false) }
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 bg-market-beige rounded-xl w-1/2" />
        <div className="h-32 bg-market-beige rounded-3xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={48} className="text-market-brown/40" />
        <p className="font-semibold text-market-dark">ไม่พบออเดอร์นี้</p>
        {error && <p role="alert">{error}</p>}
        <Link href="/orders" className="text-market-orange font-medium hover:underline">
          ดูออเดอร์ทั้งหมด
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <MarketHeader showBack backHref="/orders" title={`ออเดอร์ #${order.orderNumber}`} showCart={false} />

      <div className="px-4 pt-4 space-y-4 pb-32">
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        <p className="text-xs text-market-muted">ออเดอร์ทดลองบนอุปกรณ์นี้ ยังไม่ส่งถึงร้าน</p>
        {/* Status Card */}
        <div className="bg-card rounded-3xl p-4 shadow-warm animate-reveal-on-scroll">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">ออเดอร์</p>
              <p className="font-bold text-market-dark text-lg">#{order.orderNumber}</p>
            </div>
            <OrderStatusBadge status={order.status} size="md" />
          </div>

          {/* Progress Tracker */}
          {order.status !== 'cancelled' && (
            <OrderStatusTracker status={order.status} />
          )}

          {/* Estimated Time */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="mt-2 bg-market-cream rounded-2xl p-3 text-center">
              <p className="text-xs text-muted-foreground">เวลาโดยประมาณ</p>
              <p className="font-bold text-market-brown text-xl">
                {formatTime(order.estimatedReadyTime)}
              </p>
            </div>
          )}
        </div>

        {/* Shop & Pickup Info */}
        <div className="bg-card rounded-2xl p-4 shadow-warm-sm space-y-2.5 animate-reveal-on-scroll">
          <h3 className="font-semibold text-market-dark text-sm">ข้อมูลรับอาหาร</h3>
          <div className="flex items-center gap-2 text-sm text-market-dark">
            <Store size={15} className="text-market-orange flex-shrink-0" />
            <span>{order.shopName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-market-dark">
            <MapPin size={15} className="text-market-orange flex-shrink-0" />
            <span>จุดรับ: {order.pickupZone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <KeyRound size={15} className="text-market-orange flex-shrink-0" />
            <span className="text-muted-foreground">รหัสรับ: </span>
            <span className="font-bold text-market-brown tracking-wider">{order.pickupCode}</span>
          </div>
        </div>

        {/* Pickup Button (when ready) */}
        {order.status === 'ready' && (
          <Link
            href={`/orders/${order.id}/pickup`}
            className="block w-full text-center bg-market-orange text-white font-bold py-4 px-5 rounded-2xl shadow-orange-glow hover:bg-[#E8894E] transition-all animate-bounce-in"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={18} /> พร้อมรับอาหารแล้ว! — ดูรหัสรับ
            </span>
          </Link>
        )}

        {/* Order Items */}
        <div className="bg-card rounded-2xl p-4 shadow-warm-sm animate-reveal-on-scroll">
          <h3 className="font-semibold text-market-dark text-sm mb-3">รายการอาหาร</h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-market-dark font-medium truncate">
                    {item.quantity}× {item.productName}
                  </p>
                  {item.selectedChoices.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {item.selectedChoices.map((c) => c.choiceName).join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-market-brown flex-shrink-0">
                  ฿{item.subtotal}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-market-beige mt-3 pt-3 flex justify-between font-bold text-market-dark">
            <span>รวม</span>
            <span className="text-market-brown">฿{order.totalPrice}</span>
          </div>
        </div>

        {/* Dev: advance status button (demo) */}
        {process.env.NODE_ENV !== 'production' && order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="bg-market-cream rounded-2xl p-3 border border-dashed border-market-beige">
            <p className="text-xs text-muted-foreground text-center mb-2 flex items-center justify-center gap-1.5">
              <SlidersHorizontal size={13} /> Demo: จำลองร้านอัปเดตสถานะ
            </p>
            <button
              onClick={handleAdvanceStatus}
              disabled={advancing}
              className="w-full text-xs bg-market-beige text-market-brown font-semibold py-2 rounded-xl hover:bg-market-brown hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowRight size={14} /> จำลองขั้นถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
