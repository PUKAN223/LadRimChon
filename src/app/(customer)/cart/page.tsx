'use client'

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { CartItem, clearCart, removeItem, selectCartTotal, updateQuantity } from '@/store/slices/cart.slice'
import { MarketHeader } from '@/components/market/MarketHeader'
import { CheckCircle2, Clock, Loader2, Minus, Plus, Store, Ticket, Trash2, UtensilsCrossed, X } from 'lucide-react'
import { getOrderRepository, getProductRepository, getShopRepository } from '@/lib/repositories'
import { validateCart } from '@/lib/validate-cart'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { setCurrentOrder } from '@/store/slices/order.slice'
import { Shop } from '@/domain/shop/shop.model'
import { Order } from '@/domain/order/order.model'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { selectSelectedVoucher, selectCartVoucher, useVoucher } from '@/store/slices/voucher.slice'
import { VoucherModal } from '@/components/voucher/VoucherModal'
import { requestNotificationPermission } from '@/lib/notifications'

type CartGroup = { shopId: string; shopName: string; items: CartItem[] }
type CheckoutGroup = CartGroup & { shop: Shop }
const getCurrentTime = () => Date.now()

export default function CartPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const cart = useAppSelector((state) => state.cart)
  const total = useAppSelector(selectCartTotal)
  const user = useAppSelector((state) => state.session.user)
  const selectedVoucher = useAppSelector(selectSelectedVoucher)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [placing, setPlacing] = useState(false)
  const [checking, setChecking] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [checkoutGroups, setCheckoutGroups] = useState<CheckoutGroup[]>([])
  const [reviewedAt, setReviewedAt] = useState(0)
  const [error, setError] = useState('')
  const [cartReady, setCartReady] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCartReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (cartReady && !cart.items.length) router.replace('/')
  }, [cart.items.length, cartReady, router])

  const cartGroups = Object.values(cart.items.reduce<Record<string, CartGroup>>((groups, item) => {
    const group = groups[item.shopId] || { shopId: item.shopId, shopName: item.shopName, items: [] }
    group.items.push(item)
    groups[item.shopId] = group
    return groups
  }, {}))
  const groupTotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.subtotal, 0)
  const formatReadyTime = (minutes: number) => new Date(reviewedAt + minutes * 60 * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

  const discountAmount = selectedVoucher && total >= selectedVoucher.minSpend
    ? Math.min(selectedVoucher.discountAmount, total)
    : 0
  const finalTotal = Math.max(0, total - discountAmount)

  const handleReviewOrder = async () => {
    if (!cartGroups.length || checking || placing) return
    setChecking(true)
    setError('')
    try {
      const shopRepo = getShopRepository()
      const productRepo = getProductRepository()
      const reviewed = await Promise.all(cartGroups.map(async (group) => {
        const [shop, products] = await Promise.all([shopRepo.getShop(group.shopId), productRepo.getProducts(group.shopId)])
        const validationError = validateCart(group.items, shop, products)
        if (validationError) throw new Error(`${group.shopName}: ${validationError}`)
        if (!shop) throw new Error(`${group.shopName}: ไม่พบร้านค้า`)
        return { ...group, shop }
      }))
      setCheckoutGroups(reviewed)
      setReviewedAt(getCurrentTime())
      setShowConfirmation(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ตรวจสอบตะกร้าไม่สำเร็จ กรุณาลองใหม่')
    } finally { setChecking(false) }
  }

  const handlePlaceOrder = async () => {
    if (!user || !checkoutGroups.length || submitting.current) return
    submitting.current = true
    setPlacing(true)
    setError('')

    // Request OS notification permission so push notification alerts work when food is ready
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission().catch(() => { })
    }

    try {
      const orderRepo = getOrderRepository()
      const orderData = await Promise.all(checkoutGroups.map(async (group) => {
        const products = await getProductRepository().getProducts(group.shopId)
        const validationError = validateCart(group.items, group.shop, products)
        if (validationError) throw new Error(`${group.shopName}: ${validationError}`)
        return {
          shopId: group.shopId, shopName: group.shopName, customerId: user.id,
          items: group.items.map(({ shopId: _shopId, shopName: _shopName, ...item }) => item),
          note: orderNote, totalPrice: groupTotal(group.items), status: 'pending', orderNumber: '', pickupCode: '',
          pickupZone: group.shop.zone || 'หน้าร้าน',
          estimatedReadyTime: new Date(Date.now() + group.shop.preparationTime * 60 * 1000).toISOString(),
        } satisfies Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
      }))
      const orders = await orderRepo.createOrders(orderData)
      if (selectedVoucher && discountAmount > 0) {
        dispatch(useVoucher(selectedVoucher.id))
      }
      dispatch(setCurrentOrder(orders[0]))
      dispatch(clearCart())
      router.push('/orders')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ส่งออเดอร์ไม่สำเร็จ กรุณาลองใหม่ ตะกร้ายังอยู่ครบ')
    } finally {
      submitting.current = false
      setPlacing(false)
    }
  }

  if (!cartReady || !cart.items.length) return null

  return (
    <div className="animate-fade-in pb-32">
      <MarketHeader showBack backHref="/" title="ตะกร้า" showCart={false} />
      <div className="px-5 pt-6 space-y-6">
        <p className="text-xs text-market-muted">ตะกร้านี้มี {cartGroups.length} ร้าน ระบบจะสร้างออเดอร์แยกสำหรับแต่ละร้าน</p>
        {cartGroups.map((group) => (
          <section key={group.shopId} className="space-y-3">
            <div className="flex items-center justify-between gap-3 bg-market-orange/10 rounded-2xl p-3 border border-market-orange/20">
              <div className="flex items-center gap-2.5 min-w-0"><Store size={18} className="text-market-orange shrink-0" /><div className="min-w-0"><p className="text-xs text-muted-foreground">สั่งจากร้าน</p><p className="font-semibold text-market-dark text-sm truncate">{group.shopName}</p></div></div>
              <span className="font-bold text-market-brown text-sm shrink-0">฿{groupTotal(group.items)}</span>
            </div>
            {group.items.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl p-3 shadow-warm-sm">
                <div className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-market-cream flex items-center justify-center shrink-0 overflow-hidden border border-[#E9D7B5]/50">{item.productImageUrl ? <ImageWithSkeleton wrapperClassName="absolute inset-0" src={item.productImageUrl} alt={item.productName} className="object-cover" fallbackSrc="/images/food/default.jpg" /> : <UtensilsCrossed size={20} className="text-market-brown/50" />}</div>
                  <div className="flex-1 min-w-0"><h3 className="font-semibold text-market-dark text-sm truncate">{item.productName}</h3>
                    {item.selectedChoices.length > 0 && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.selectedChoices.map((choice) => choice.choiceName).join(', ')}</p>}
                    {item.note && <p className="text-xs text-muted-foreground mt-0.5 italic">“{item.note}”</p>}
                    <div className="flex items-center justify-between mt-2"><span className="font-bold text-market-brown text-sm">฿{item.subtotal}</span><div className="flex items-center gap-2">
                      <button aria-label={item.quantity <= 1 ? `นำ ${item.productName} ออกจากตะกร้า` : `ลดจำนวน ${item.productName}`} disabled={placing} onClick={() => item.quantity <= 1 ? dispatch(removeItem(item.id)) : dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} className="w-11 h-11 rounded-full bg-market-cream border border-market-beige flex items-center justify-center">{item.quantity <= 1 ? <Trash2 size={12} className="text-red-400" /> : <Minus size={12} />}</button>
                      <span className="text-sm font-semibold text-market-dark w-4 text-center">{item.quantity}</span>
                      <button aria-label={`เพิ่มจำนวน ${item.productName}`} disabled={placing || item.quantity >= 99} onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="w-11 h-11 rounded-full bg-market-orange text-white flex items-center justify-center"><Plus size={12} /></button>
                    </div></div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ))}
        <div><label className="font-semibold text-market-dark text-sm block mb-2">หมายเหตุถึงทุกร้าน (ถ้ามี)</label><textarea aria-label="หมายเหตุถึงทุกร้าน" maxLength={300} disabled={placing} value={orderNote} onChange={(event) => setOrderNote(event.target.value)} placeholder="เช่น มารับพร้อมกัน..." rows={2} className="w-full px-4 py-3 bg-card border-2 border-market-beige rounded-2xl text-sm text-market-dark placeholder:text-muted-foreground focus:outline-none focus:border-market-orange/60 resize-none" /></div>

        {/* Voucher Selector */}
        <div className="bg-white rounded-2xl p-3.5 border border-market-beige/60 shadow-warm-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-market-orange/15 text-market-orange flex items-center justify-center shrink-0">
                <Ticket size={18} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-market-dark">คูปองส่วนลด</p>
                {selectedVoucher && discountAmount > 0 ? (
                  <p className="text-[11px] text-emerald-700 font-bold truncate">
                    {selectedVoucher.title} (-฿{discountAmount})
                  </p>
                ) : (
                  <p className="text-[11px] text-market-muted">แลกแต้มหรือเลือกคูปอง</p>
                )}
              </div>
            </div>

            {selectedVoucher && discountAmount > 0 ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(true)}
                  className="text-xs font-bold text-market-orange hover:text-[#E8894E] px-2 py-1 rounded-lg hover:bg-orange-50 active:scale-95 transition-all"
                >
                  เปลี่ยน
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(selectCartVoucher(null))}
                  aria-label="ยกเลิกการใช้คูปอง"
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center active:scale-90 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVoucherModal(true)}
                className="text-xs font-bold text-market-brown bg-[#FAF7F0] border border-[#E9D7B5]/70 hover:bg-[#F2ECE1] active:scale-95 px-3 py-1.5 rounded-xl transition-all"
              >
                เลือกคูปอง
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-market-muted leading-relaxed">ออเดอร์เป็นข้อมูลจำลองบนอุปกรณ์นี้ และยังไม่มีการตัดเงินจริง</p>

        {/* Pricing Summary */}
        <div className="bg-white rounded-2xl p-4 border border-market-beige/60 space-y-2.5">
          <div className="flex justify-between text-sm text-market-muted">
            <span>ยอดรวมสินค้า</span>
            <span className="font-semibold text-market-dark">฿{total}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-700 font-bold">
              <span className="flex items-center gap-1.5">
                <Ticket size={14} /> ส่วนลดคูปอง ({selectedVoucher?.code})
              </span>
              <span>-฿{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-market-dark border-t border-market-beige/50 pt-2.5">
            <span>ยอดที่ต้องชำระ</span>
            <span className="text-market-brown text-xl">฿{finalTotal}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#F7F3E8]/95 backdrop-blur-md border-t border-[#E9D7B5] z-50 shadow-[0_-4px_16px_rgba(46,35,24,0.06)]">
        {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
        <button onClick={handleReviewOrder} disabled={placing || checking} className="w-full flex items-center justify-between bg-market-brown text-white font-bold py-3.5 px-5 rounded-2xl shadow-warm-lg disabled:opacity-60 hover:bg-[#8C6540] active:scale-[0.99] transition-all"><span className="flex items-center gap-2">{placing || checking ? <><Loader2 size={18} className="animate-spin" />{checking ? 'กำลังตรวจสอบรายการ...' : 'กำลังส่งออเดอร์...'}</> : <><CheckCircle2 size={18} className="text-emerald-400" />ตรวจสอบและยืนยัน</>}</span><span className="font-black text-lg">฿{finalTotal}</span></button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && <div className="fixed inset-0 z-[60] flex items-end bg-black/45 animate-modal-backdrop" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="confirm-order-title" className="w-full max-w-[430px] mx-auto bg-white rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.22)] animate-bottom-sheet">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-market-muted">ตรวจสอบก่อนส่ง</p><h2 id="confirm-order-title" className="font-bold text-market-dark text-lg mt-0.5">ยืนยัน {checkoutGroups.length} ออเดอร์</h2></div><button type="button" onClick={() => setShowConfirmation(false)} disabled={placing} aria-label="ปิดหน้าต่างยืนยันออเดอร์" className="w-11 h-11 rounded-full bg-market-cream text-market-dark flex items-center justify-center"><X size={18} /></button></div>
        <div className="mt-4 divide-y divide-market-beige/70 border-y border-market-beige/70 max-h-[40dvh] overflow-y-auto">{checkoutGroups.map((group) => <div key={group.shopId} className="py-3"><div className="flex justify-between gap-3 text-sm"><span className="font-semibold text-market-dark">{group.shopName}</span><span className="font-bold text-market-brown">฿{groupTotal(group.items)}</span></div><div className="mt-1 flex items-center justify-between text-xs text-market-muted"><span>{group.items.reduce((sum, item) => sum + item.quantity, 0)} รายการ · รับที่ {group.shop.zone}</span><span className="flex items-center gap-1"><Clock size={12} />{formatReadyTime(group.shop.preparationTime)} น.</span></div></div>)}</div>
        {discountAmount > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <Ticket size={14} /> ส่วนลด {selectedVoucher?.title}
            </span>
            <span>-฿{discountAmount}</span>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between font-bold text-market-dark"><span>ยอดรวมทั้งหมด</span><span className="text-market-brown text-xl">฿{finalTotal}</span></div><p className="mt-2 text-xs text-market-muted">ระบบจะสร้างรหัสรับอาหารแยกตามร้าน</p>
        <button type="button" onClick={handlePlaceOrder} disabled={placing} className="mt-4 w-full min-h-12 bg-market-orange text-white font-bold rounded-2xl shadow-warm disabled:opacity-60">{placing ? 'กำลังส่งออเดอร์...' : `ส่ง ${checkoutGroups.length} ออเดอร์ ฿${finalTotal}`}</button>
      </div></div>}

      {/* Voucher Modal */}
      <VoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        cartTotal={total}
      />
    </div>
  )
}
