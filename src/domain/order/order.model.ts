export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export interface Order {
  id: string
  orderNumber: string
  shopId: string
  shopName: string
  customerId: string
  items: OrderItem[]
  note: string
  totalPrice: number
  status: OrderStatus
  pickupCode: string
  pickupZone: string
  estimatedReadyTime: string // ISO string
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImageUrl: string
  price: number
  quantity: number
  selectedChoices: SelectedChoice[]
  note: string
  subtotal: number
}

export interface SelectedChoice {
  optionId: string
  optionName: string
  choiceId: string
  choiceName: string
  priceAdd: number
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'รับออเดอร์แล้ว',
  accepted: 'ยืนยันออเดอร์',
  preparing: 'กำลังทำอาหาร',
  ready: 'พร้อมรับ',
  completed: 'รับอาหารแล้ว',
  cancelled: 'ยกเลิก',
}

