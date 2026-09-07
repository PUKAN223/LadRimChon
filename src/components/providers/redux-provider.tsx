'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { useEffect } from 'react'
import { restoreCart, CartState } from '@/store/slices/cart.slice'
import { setSessionHydrated, setUser } from '@/store/slices/session.slice'
import { CartActionsProvider } from './cart-actions-provider'

const CART_KEY = 'ladrimchon_cart_v2'
const LEGACY_CART_KEY = 'ladrimchon_cart_v1'
const SESSION_KEY = 'ladrimchon_session_v1'

function isCart(value: unknown): value is CartState {
  if (!value || typeof value !== 'object') return false
  const cart = value as CartState
  return Array.isArray(cart.items) && cart.items.every((item) =>
      item && typeof item.id === 'string' && typeof item.productId === 'string' &&
      typeof item.productName === 'string' && typeof item.shopId === 'string' &&
      typeof item.shopName === 'string' && typeof item.note === 'string' &&
      Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) &&
      item.quantity > 0 && item.quantity <= 99 && item.subtotal === item.price * item.quantity &&
      Array.isArray(item.selectedChoices) && item.selectedChoices.every((c) =>
        c && typeof c.optionId === 'string' && typeof c.choiceId === 'string' &&
        typeof c.choiceName === 'string' && Number.isFinite(c.priceAdd)))
}

function isUser(value: unknown): value is { id: string; name: string; studentId: string; email: string; phone: string; avatarUrl?: string; points?: number } {
  if (!value || typeof value !== 'object') return false
  const user = value as Record<string, unknown>
  return typeof user.id === 'string' && typeof user.name === 'string' && typeof user.studentId === 'string' && typeof user.email === 'string' && typeof user.phone === 'string' &&
    (user.avatarUrl === undefined || typeof user.avatarUrl === 'string') && (user.points === undefined || (typeof user.points === 'number' && Number.isFinite(user.points)))
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const current = localStorage.getItem(CART_KEY)
      const saved: unknown = JSON.parse(current || localStorage.getItem(LEGACY_CART_KEY) || 'null')
      if (isCart(saved)) {
        store.dispatch(restoreCart(saved))
      } else if (saved && typeof saved === 'object') {
        const legacy = saved as { shopId?: unknown; shopName?: unknown; items?: unknown[] }
        if (typeof legacy.shopId === 'string' && typeof legacy.shopName === 'string' && Array.isArray(legacy.items)) {
          const migratedItems = legacy.items
            .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
            .map((item) => ({ ...item, shopId: legacy.shopId, shopName: legacy.shopName })) as CartState['items']
          store.dispatch(restoreCart({ items: migratedItems }))
        }
      }
      if (!current && saved) {
        localStorage.setItem(CART_KEY, JSON.stringify(store.getState().cart))
        localStorage.removeItem(LEGACY_CART_KEY)
      }
    } catch { /* Storage may be unavailable; keep the current in-memory cart. */ }
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
      if (isUser(saved)) store.dispatch(setUser(saved))
    } catch { /* A missing session is valid. */ }
    store.dispatch(setSessionHydrated())
    let previous = store.getState().cart
    let previousSession = store.getState().session
    return store.subscribe(() => {
      const cart = store.getState().cart
      if (previous !== cart) {
        previous = cart
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch { /* Checkout reports storage errors. */ }
      }
      const session = store.getState().session
      if (previousSession !== session) {
        previousSession = session
        try {
          if (session.user) localStorage.setItem(SESSION_KEY, JSON.stringify(session.user))
          else localStorage.removeItem(SESSION_KEY)
        } catch { /* Session persistence is optional when storage is unavailable. */ }
      }
    })
  }, [])
  return <Provider store={store}><CartActionsProvider>{children}</CartActionsProvider></Provider>
}
