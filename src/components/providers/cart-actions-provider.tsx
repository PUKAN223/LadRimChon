'use client'

import { createContext, useContext } from 'react'
import { useStore } from 'react-redux'
import { RootState } from '@/store'
import { addItem, NewCartItem } from '@/store/slices/cart.slice'

type Addition = { shopId: string; shopName: string; item: NewCartItem }
const CartActionsContext = createContext<((addition: Addition) => void) | null>(null)

export function CartActionsProvider({ children }: { children: React.ReactNode }) {
  const store = useStore<RootState>()
  function requestAddition(addition: Addition) {
    store.dispatch(addItem(addition))
  }

  return (
    <CartActionsContext.Provider value={requestAddition}>
      {children}
    </CartActionsContext.Provider>
  )
}

export function useCartActions() {
  const context = useContext(CartActionsContext)
  if (!context) throw new Error('CartActionsProvider is required')
  return context
}
