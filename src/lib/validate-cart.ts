import type { CartItem } from '@/store/slices/cart.slice'
import type { Product } from '@/domain/product/product.model'
import type { Shop } from '@/domain/shop/shop.model'

/** Client-side UX validation only. A real checkout must repeat this on the server. */
export function validateCart(items: CartItem[], shop: Shop | null, products: Product[]): string | null {
  if (!shop || !shop.isOpen) return 'ร้านปิดอยู่ กรุณาเลือกร้านที่เปิดให้บริการ'
  if (!items.length) return 'กรุณาเลือกอาหารก่อนยืนยันออเดอร์'
  const quantities = new Map<string, number>()
  for (const item of items) {
    if (item.shopId !== shop.id) return 'พบรายการอาหารจากร้านอื่น กรุณาลองใหม่'
    const product = products.find((p) => p.id === item.productId && p.shopId === shop.id)
    if (!product || !product.isAvailable) return `เมนู ${item.productName} ไม่พร้อมขาย กรุณานำออกจากตะกร้า`
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return 'จำนวนอาหารไม่ถูกต้อง'
    const count = (quantities.get(product.id) ?? 0) + item.quantity
    quantities.set(product.id, count)
    if (product.stock !== null && count > product.stock) return `${product.name} เหลือ ${product.stock} รายการ กรุณาลดจำนวนหรือนำออก`
    let price = product.price
    const seen = new Set<string>()
    for (const selected of item.selectedChoices) {
      const option = product.options.find((o) => o.id === selected.optionId)
      const choice = option?.choices.find((c) => c.id === selected.choiceId)
      const key = `${selected.optionId}:${selected.choiceId}`
      if (!choice || seen.has(key)) return `ตัวเลือกของ ${product.name} เปลี่ยนแล้ว กรุณาเลือกเมนูใหม่`
      seen.add(key)
      price += choice.priceAdd
    }
    for (const option of product.options) {
      const count = item.selectedChoices.filter((c) => c.optionId === option.id).length
      if ((option.required && count === 0) || count > option.maxSelect) return `กรุณาเลือก${option.name}ของ ${product.name} ใหม่`
    }
    if (price !== item.price || item.subtotal !== price * item.quantity) return `ราคา ${product.name} เปลี่ยนแล้ว กรุณานำออกและเลือกเมนูใหม่`
  }
  return null
}
