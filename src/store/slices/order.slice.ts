import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Order } from '@/domain/order/order.model'

interface OrderState {
  currentOrder: Order | null
  recentOrders: Order[]
}

const initialState: OrderState = {
  currentOrder: null,
  recentOrders: [],
}

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload
    },
    updateCurrentOrderStatus: (
      state,
      action: PayloadAction<Order['status']>
    ) => {
      if (state.currentOrder) {
        state.currentOrder.status = action.payload
        state.currentOrder.updatedAt = new Date().toISOString()
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    setRecentOrders: (state, action: PayloadAction<Order[]>) => {
      state.recentOrders = action.payload
    },
  },
})

export const {
  setCurrentOrder,
  updateCurrentOrderStatus,
  clearCurrentOrder,
  setRecentOrders,
} = orderSlice.actions

export default orderSlice.reducer
