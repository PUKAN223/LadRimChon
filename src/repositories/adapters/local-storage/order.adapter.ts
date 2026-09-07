import { Order } from '@/domain/order/order.model'
import { OrderRepository } from '@/repositories/interfaces/order.repository'

const STORAGE_KEY = 'ladrimchon_orders'
const READY_AFTER_MS = 5_000

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

  private getOrdersWithAutomaticStatusUpdates(): Order[] {
    const orders = this.getOrdersFromStorage()
    const now = Date.now()
    let changed = false
    const updatedOrders = orders.map((order) => {
      const isReady = order.status === 'pending' && now - new Date(order.createdAt).getTime() >= READY_AFTER_MS
      if (!isReady) return order
      changed = true
      return { ...order, status: 'ready' as const, updatedAt: new Date(now).toISOString() }
    })

    if (changed) this.saveOrders(updatedOrders)
    return updatedOrders
  }

  private generateOrderId(): string {
    const uuid = globalThis.crypto?.randomUUID?.()
    return uuid ? `order-${uuid}` : `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
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
    const orders = this.getOrdersWithAutomaticStatusUpdates()
    return orders.filter((o) => o.customerId === customerId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getOrder(id: string): Promise<Order | null> {
    const orders = this.getOrdersWithAutomaticStatusUpdates()
    return orders.find((o) => o.id === id) ?? null
  }

  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    const [order] = await this.createOrders([orderData])
    return order
  }

  async createOrders(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<Order[]> {
    if (!orderData.length) return []
    const orders = this.getOrdersWithAutomaticStatusUpdates()
    const now = new Date().toISOString()
    const newOrders = orderData.map((data) => ({
      ...data,
      id: this.generateOrderId(),
      orderNumber: this.generateOrderNumber(),
      pickupCode: this.generatePickupCode(),
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }))
    orders.unshift(...newOrders)
    this.saveOrders(orders)
    return newOrders
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const orders = this.getOrdersWithAutomaticStatusUpdates()
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
    const orders = this.getOrdersWithAutomaticStatusUpdates()
    return orders.find((o) => o.pickupCode === code) ?? null
  }
}
