import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cart.slice'
import orderReducer from './slices/order.slice'
import uiReducer from './slices/ui.slice'
import sessionReducer from './slices/session.slice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    order: orderReducer,
    ui: uiReducer,
    session: sessionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
