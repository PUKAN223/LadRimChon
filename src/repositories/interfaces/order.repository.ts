import { Order } from '@/domain/order/order.model'

export interface OrderRepository {
  getOrders(customerId: string): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>
  createOrders(orders: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Order[]>
  updateOrderStatus(id: string, status: Order['status']): Promise<Order>
  getOrderByPickupCode(code: string): Promise<Order | null>
}
