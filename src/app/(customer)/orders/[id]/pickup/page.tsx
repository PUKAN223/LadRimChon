'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Order } from '@/domain/order/order.model'
import { getOrderRepository } from '@/lib/repositories'
import { PickupCode } from '@/components/order/PickupCode'
import { MarketHeader } from '@/components/market/MarketHeader'
import { CheckCircle2, AlertCircle, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/hooks'
import { updateCurrentOrderStatus } from '@/store/slices/order.slice'

export default function PickupPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  useEffect(() => {
    const load = async () => {
      const orderRepo = getOrderRepository()
      const data = await orderRepo.getOrder(id)
      setOrder(data)
      setLoading(false)
    }
    load().catch(() => { setError('โหลดออเดอร์ไม่สำเร็จ'); setLoading(false) })
  }, [id])

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const from = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    const to = new Date(d.getTime() + 15 * 60 * 1000).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${from} – ${to}`
  }

  const handleComplete = async () => {
    if (!order || submitting.current || order.status !== 'ready') return
    submitting.current = true
    setCompleting(true)
    setError('')
    try {
    const orderRepo = getOrderRepository()
    const latest = await orderRepo.getOrder(id)
    if (latest?.status !== 'ready') throw new Error('ออเดอร์ยังไม่พร้อมรับ กรุณากลับไปตรวจสถานะ')
    await orderRepo.updateOrderStatus(id, 'completed')
    dispatch(updateCurrentOrderStatus('completed'))
    setCompleted(true)
    } catch (error) { setError(error instanceof Error ? error.message : 'ยืนยันไม่สำเร็จ กรุณาลองใหม่') }
    finally {
    submitting.current = false
    setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-48 bg-market-beige rounded-3xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={48} className="text-market-brown/40" />
        <p className="font-semibold text-market-dark">ไม่พบออเดอร์</p>
        {error && <p role="alert">{error}</p>}
        <Link href="/orders" className="underline">กลับไปดูออเดอร์</Link>
      </div>
    )
  }

  if (completed || order.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce-in shadow-warm">
          <CheckCircle2 size={48} />
        </div>
        <div className="text-center">
          <h2 className="font-bold text-market-dark text-2xl">รับอาหารแล้ว!</h2>
          <p className="text-muted-foreground mt-1">ขอบคุณที่ใช้บริการหลาดริมชล</p>
        </div>
        <Link
          href="/"
          className="bg-market-orange text-white font-semibold px-8 py-3 rounded-2xl shadow-orange-glow hover:bg-[#E8894E] transition-all"
        >
          กลับหน้าแรก
        </Link>
      </div>
    )
  }

  if (order.status !== 'ready') {
    return <div className="p-6 min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <AlertCircle size={40} className="text-market-brown" />
      <h1 className="text-lg font-bold">{order.status === 'cancelled' ? 'ออเดอร์ถูกยกเลิกแล้ว' : 'อาหารยังไม่พร้อมรับ'}</h1>
      <Link href={`/orders/${id}`} className="min-h-11 underline text-market-brown">กลับไปตรวจสถานะออเดอร์</Link>
    </div>
  }

  return (
    <div className="animate-fade-in">
      <MarketHeader showBack backHref={`/orders/${id}`} title="รับอาหาร" showCart={false} />

      <div className="px-4 pt-4 space-y-4 pb-32">
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {/* Ready Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-green-700 text-sm">อาหารพร้อมแล้ว!</p>
            <p className="text-green-600 text-xs">กรุณาไปรับที่ร้านได้เลย</p>
          </div>
        </div>

        {/* Pickup Code Card */}
        <PickupCode
          code={order.pickupCode}
          orderNumber={order.orderNumber}
          shopName={order.shopName}
          zone={order.pickupZone}
          estimatedTime={formatTime(order.estimatedReadyTime)}
        />

        {/* Items reminder */}
        <div className="bg-card rounded-2xl p-4 shadow-warm-sm">
          <h3 className="font-semibold text-market-dark text-sm mb-2">รายการของคุณ</h3>
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-market-dark">
                  {item.quantity}× {item.productName}
                </span>
                <span className="text-muted-foreground">฿{item.subtotal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm received */}
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full bg-market-green text-white font-bold py-4 px-5 rounded-2xl shadow-warm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {completing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> กำลังยืนยัน...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> ยืนยันรับอาหารแล้ว
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
