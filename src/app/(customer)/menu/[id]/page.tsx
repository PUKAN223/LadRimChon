'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Product, ProductChoice } from '@/domain/product/product.model'
import { getProductRepository, getShopRepository } from '@/lib/repositories'
import { useCartActions } from '@/components/providers/cart-actions-provider'
import Link from 'next/link'
import { NewCartItem } from '@/store/slices/cart.slice'
import { SelectedChoice } from '@/domain/order/order.model'
import { Minus, Plus, ShoppingCart, SearchX, Flame, Star, CheckCircle2 } from 'lucide-react'

import { DetailHero } from '@/components/market/DetailHero'

export default function MenuDetailPage() {
  const { id } = useParams<{ id: string }>()
  const requestAddition = useCartActions()

  const [product, setProduct] = useState<Product | null>(null)
  const [shopName, setShopName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [selectedChoices, setSelectedChoices] = useState<Record<string, ProductChoice>>({})
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [error, setError] = useState('')
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
  }, [])

  useEffect(() => {
    const load = async () => {
      const productRepo = getProductRepository()
      const shopRepo = getShopRepository()
      const p = await productRepo.getProduct(id)
      if (p) {
        setProduct(p)
        const s = await shopRepo.getShop(p.shopId)
        if (s) { setShopName(s.name); setShopOpen(s.isOpen) }
      }
      setLoading(false)
    }
    load().catch(() => { setError('โหลดเมนูไม่สำเร็จ กรุณาลองใหม่'); setLoading(false) })
  }, [id])

  const getUnitPrice = () => {
    if (!product) return 0
    const addOns = Object.values(selectedChoices).reduce((s, c) => s + c.priceAdd, 0)
    return product.price + addOns
  }

  const handleChoiceSelect = (optionId: string, choice: ProductChoice) => {
    setSelectedChoices((prev) => ({ ...prev, [optionId]: choice }))
    setError('')
  }

  const handleAddToCart = async () => {
    if (!product || adding || !shopOpen || !product.isAvailable || product.stock === 0) return
    const missing = product.options.find((option) => option.required && !selectedChoices[option.id])
    if (missing) {
      setError(`กรุณาเลือก${missing.name}ก่อนเพิ่มลงตะกร้า`)
      document.getElementById(missing.id)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    setAdding(true)
    const unitPrice = getUnitPrice()
    const choices: SelectedChoice[] = Object.entries(selectedChoices).map(([optionId, choice]) => {
      const option = product.options.find((o) => o.id === optionId)!
      return {
        optionId,
        optionName: option.name,
        choiceId: choice.id,
        choiceName: choice.name,
        priceAdd: choice.priceAdd,
      }
    })
    const cartItem: NewCartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      price: unitPrice,
      quantity,
      selectedChoices: choices,
      note,
      subtotal: unitPrice * quantity,
    }
    requestAddition({ shopId: product.shopId, shopName, item: cartItem })
    setAdded(true)
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setAdded(false), 3000)
    setAdding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3E8]">
        <header className="sticky top-0 z-40 bg-[#F7F3E8] border-b border-[#E9D7B5]/60 h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] px-5 flex items-center justify-between">
          <div className="w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70" />
          <div className="h-4 w-32 rounded-md skeleton-shimmer" />
          <div className="w-11 h-11 rounded-full bg-white border border-[#E9D7B5]/70" />
        </header>
        <div className="detail-hero skeleton-shimmer" />
        <div className="detail-surface space-y-4 pt-6">
          <div className="h-6 bg-market-beige rounded-xl w-3/4 skeleton-shimmer" />
          <div className="h-4 bg-market-beige rounded-xl w-full skeleton-shimmer" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <SearchX size={48} className="text-market-brown/40" />
        <p className="text-market-dark font-semibold">ไม่พบเมนูนี้</p>
        {error && <p role="alert">{error}</p>}
        <Link href="/shops" className="text-market-brown underline">กลับไปเลือกร้านอาหาร</Link>
      </div>
    )
  }

  const unitPrice = getUnitPrice()
  const total = unitPrice * quantity

  return (
    <div className="animate-fade-in pb-32">
      <DetailHero
        src={product.imageUrl || '/images/food/default.jpg'}
        alt={product.name}
        backHref={`/shops/${product.shopId}`}
        title={product.name}
        favoriteType="product"
        favoriteId={product.id}
      />

      <div className="detail-surface space-y-6">
        {/* Product Info */}
        <div>
          {(product.tags.includes('bestseller') || product.tags.includes('popular')) && (
            <div className="flex gap-1.5 mb-2">
              {product.tags.includes('bestseller') && (
                <span className="inline-flex items-center gap-1 text-xs bg-market-orange/15 text-market-orange font-semibold px-2 py-0.5 rounded-full">
                  <Flame size={12} className="fill-market-orange" /> ขายดี
                </span>
              )}
              {product.tags.includes('popular') && (
                <span className="inline-flex items-center gap-1 text-xs bg-market-green/15 text-market-green font-semibold px-2 py-0.5 rounded-full">
                  <Star size={12} className="fill-market-green" /> ยอดนิยม
                </span>
              )}
            </div>
          )}
          <h1 className="font-bold text-market-dark text-xl">{product.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{product.description}</p>
          <p className="font-bold text-market-brown text-2xl mt-2">฿{product.price}</p>
        </div>

        {/* Options */}
        {product.options.map((option) => (
          <div key={option.id} id={option.id} className="space-y-2 scroll-mt-24">
            <h3 className="font-semibold text-market-dark text-sm flex items-center gap-2">
              {option.name}
              {option.required && (
                <span className="text-[10px] bg-red-50 text-red-500 font-medium px-1.5 py-0.5 rounded-full">จำเป็น</span>
              )}
              {!option.required && <button type="button" className="ml-auto text-xs underline min-h-11" onClick={() => setSelectedChoices((prev) => {
                const next = { ...prev }; delete next[option.id]; return next
              })}>ไม่เพิ่ม</button>}
            </h3>
            <div className="space-y-2">
              {option.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${selectedChoices[option.id]?.id === choice.id
                    ? 'border-market-orange bg-market-orange/5'
                    : 'border-market-beige bg-card hover:border-market-brown/30'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedChoices[option.id]?.id === choice.id
                        ? 'border-market-orange bg-market-orange'
                        : 'border-market-beige'
                        }`}
                    >
                      {selectedChoices[option.id]?.id === choice.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm text-market-dark">{choice.name}</span>
                  </div>
                  {choice.priceAdd > 0 && (
                    <span className="text-sm text-market-orange font-semibold">+฿{choice.priceAdd}</span>
                  )}
                  <input
                    type="radio"
                    name={option.id}
                    checked={selectedChoices[option.id]?.id === choice.id}
                    className="sr-only"
                    onChange={() => handleChoiceSelect(option.id, choice)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Note */}
        <div>
          <label className="font-semibold text-market-dark text-sm block mb-2">
            หมายเหตุถึงร้าน (ถ้ามี)
          </label>
          <textarea
            aria-label="หมายเหตุถึงร้าน"
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น ไม่ใส่ผัก, ไม่เผ็ด..."
            rows={2}
            className="w-full px-4 py-3 bg-card border border-market-beige rounded-2xl text-sm text-market-dark placeholder:text-muted-foreground focus:outline-none focus:border-market-orange/60 transition-colors resize-none"
          />
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-market-dark">จำนวน</span>
          <div className="flex items-center gap-3">
            <button
              aria-label="ลดจำนวน"
              disabled={quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 rounded-full bg-market-cream border border-market-beige flex items-center justify-center hover:bg-market-beige transition-colors"
            >
              <Minus size={16} className="text-market-dark" />
            </button>
            <span className="font-bold text-market-dark text-lg w-6 text-center">{quantity}</span>
            <button
              aria-label="เพิ่มจำนวน"
              disabled={quantity >= Math.min(product.stock ?? 99, 99)}
              onClick={() => setQuantity(Math.min(quantity + 1, product.stock ?? 99, 99))}
              className="w-11 h-11 rounded-full bg-market-orange text-white flex items-center justify-center hover:bg-[#E8894E] transition-colors shadow-warm-xs"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#F7F3E8]/95 backdrop-blur-md border-t border-[#E9D7B5] z-50">
        {error && <p role="alert" className="text-sm text-red-700 mb-2">{error}</p>}
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable || product.stock === 0 || !shopOpen || adding}
          className="w-full flex items-center justify-between bg-market-brown text-white font-bold py-3.5 px-5 rounded-2xl hover:bg-[#8A6540] transition-colors duration-200 active:bg-[#8A6540] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <span>{!shopOpen ? 'ร้านปิดอยู่' : !product.isAvailable || product.stock === 0 ? 'เมนูหมด' : adding ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}</span>
          </div>
          <span className="font-black text-lg">฿{total}</span>
        </button>
      </div>

      {added && (
        <div role="status" className="fixed left-1/2 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-[60] w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 animate-slide-up">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-market-dark px-4 py-3 text-white shadow-warm-lg">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
              <span className="text-sm font-semibold truncate">เพิ่ม {product.name} ลงตะกร้าแล้ว</span>
            </div>
            <Link href="/cart" className="shrink-0 text-xs font-bold text-market-orange-light underline underline-offset-2">ดูตะกร้า</Link>
          </div>
        </div>
      )}
    </div>
  )
}
