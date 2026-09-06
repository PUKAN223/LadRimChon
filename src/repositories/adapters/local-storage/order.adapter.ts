import { Order } from '@/domain/order/order.model'
import { OrderRepository } from '@/repositories/interfaces/order.repository'

const STORAGE_KEY = 'ladrimchon_orders'

export class LocalStorageOrderAdapter implements OrderRepository {
  private getOrdersFromStorage(): Order[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      return JSON.parse(data) as Order[]
    } catch {
      return []
    }
  }

  private saveOrders(orders: Order[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  }

  private generateOrderNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const letter = chars[Math.floor(Math.random() * chars.length)]
    const number = Math.floor(100 + Math.random() * 900)
    return `${letter}${number}`
  }

  private generatePickupCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000))
  }

  async getOrders(customerId: string): Promise<Order[]> {
    const orders = this.getOrdersFromStorage()
    return orders.filter((o) => o.customerId === customerId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getOrder(id: string): Promise<Order | null> {
    const orders = this.getOrdersFromStorage()
    return orders.find((o) => o.id === id) ?? null
  }

  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    const orders = this.getOrdersFromStorage()
    const now = new Date().toISOString()
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      orderNumber: this.generateOrderNumber(),
      pickupCode: this.generatePickupCode(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }
    orders.unshift(newOrder)
    this.saveOrders(orders)
    return newOrder
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const orders = this.getOrdersFromStorage()
    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) throw new Error(`Order ${id} not found`)
    orders[index] = {
      ...orders[index],
      status,
      updatedAt: new Date().toISOString(),
    }
    this.saveOrders(orders)
    return orders[index]
  }

  async getOrderByPickupCode(code: string): Promise<Order | null> {
    const orders = this.getOrdersFromStorage()
    return orders.find((o) => o.pickupCode === code) ?? null
  }
}
