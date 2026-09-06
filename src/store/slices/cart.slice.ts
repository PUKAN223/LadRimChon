import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OrderItem } from '@/domain/order/order.model'

export interface CartState {
  items: CartItem[]
}

export type CartItem = OrderItem & {
  shopId: string
  shopName: string
}

export type NewCartItem = Omit<CartItem, 'shopId' | 'shopName'>

const initialState: CartState = {
  items: [],
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ shopId: string; shopName: string; item: NewCartItem }>) => {
      const { shopId, shopName, item } = action.payload
      if (!item) return
      const qty = Math.max(1, Math.min(99, Math.trunc(item.quantity) || 1))
      // Match items only within the same shop and configuration.
      const existing = state.items.find(
        (i) => i.shopId === shopId && i.productId === item.productId && i.price === item.price &&
          i.note.trim() === item.note.trim() &&
          JSON.stringify(i.selectedChoices.map((c) => c.choiceId).sort()) ===
          JSON.stringify(item.selectedChoices.map((c) => c.choiceId).sort())
      )
      if (existing) {
        existing.quantity = Math.min(99, existing.quantity + qty)
        existing.subtotal = existing.price * existing.quantity
      } else {
        state.items.push({
          ...item,
          shopId,
          shopName,
          quantity: qty,
          subtotal: item.price * qty,
        })
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = (state.items || []).filter((i) => i && i.id !== action.payload)
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = (state.items || []).find((i) => i && i.id === action.payload.id)
      if (item) {
        item.quantity = Math.max(1, Math.min(99, Math.trunc(action.payload.quantity) || 1))
        item.subtotal = item.price * item.quantity
      }
    },
    clearCart: (state) => {
      state.items = []
    },
    restoreCart: (_state, action: PayloadAction<CartState>) => action.payload,
    setOrderNote: (state, action: PayloadAction<{ id: string; note: string }>) => {
      const item = (state.items || []).find((i) => i && i.id === action.payload.id)
      if (item) item.note = action.payload.note
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, restoreCart, setOrderNote } = cartSlice.actions

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart?.items?.reduce((sum, item) => sum + (item?.subtotal || 0), 0) ?? 0

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart?.items?.reduce((sum, item) => sum + (item?.quantity || 0), 0) ?? 0

export default cartSlice.reducer
