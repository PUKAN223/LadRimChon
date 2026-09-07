'use client'

import { useEffect } from 'react'
import { Order } from '@/domain/order/order.model'
import { getOrderRepository } from '@/lib/repositories'
import { useAppSelector } from '@/lib/hooks'
import { playOrderReadySound } from '@/lib/sound'
import { sendSystemNotification } from '@/lib/notifications'

const NOTIFIED_ORDERS_KEY = 'ladrimchon_notified_ready_orders_v1'

/**
 * Headless order notification listener.
 * Triggers native system push notification and audio chime when an order is ready,
 * without rendering an intrusive in-app floating banner.
 */
export function OrderReadyBanner() {
  const user = useAppSelector((s) => s.session.user)

  useEffect(() => {
    let scheduledTimers: NodeJS.Timeout[] = []

    const checkOrders = async () => {
      try {
        const orderRepo = getOrderRepository()
        const orders = await orderRepo.getOrders(user?.id || 'user-demo').catch(() => [])

        // Find orders that are 'ready'
        const readyOrders = orders.filter((o: Order) => o.status === 'ready')

        for (const ready of readyOrders) {
          // Check if already notified
          let notifiedIds: string[] = []
          try {
            const raw = sessionStorage.getItem(NOTIFIED_ORDERS_KEY)
            if (raw) notifiedIds = JSON.parse(raw)
          } catch {
            // ignore
          }

          if (!notifiedIds.includes(ready.id)) {
            // New ready order! Play sound & trigger real OS Push Notification
            playOrderReadySound()
            await sendSystemNotification({
              title: '🍲 อาหารพร้อมรับแล้ว!',
              body: `ร้าน ${ready.shopName} · รหัสรับ #${ready.pickupCode || ready.orderNumber} (แตะเพื่อเปิดรหัสรับอาหาร)`,
              url: `/orders/${ready.id}/pickup`,
              tag: `order-ready-${ready.id}`,
            })
            notifiedIds.push(ready.id)
            try {
              sessionStorage.setItem(NOTIFIED_ORDERS_KEY, JSON.stringify(notifiedIds))
            } catch {
              // ignore
            }
          }
        }

        // Schedule precise timer for pending orders to prevent background tab throttling
        const pendingOrders = orders.filter((o: Order) => o.status === 'pending')
        scheduledTimers.forEach(clearTimeout)
        scheduledTimers = []

        pendingOrders.forEach((p) => {
          const readyAt = new Date(p.createdAt).getTime() + 5000
          const delay = Math.max(100, readyAt - Date.now())
          const t = setTimeout(() => {
            void checkOrders()
          }, delay + 100)
          scheduledTimers.push(t)
        })
      } catch {
        // ignore errors
      }
    }

    // Check immediately and periodically
    void checkOrders()
    const interval = setInterval(checkOrders, 3000)

    const handleFocus = () => { void checkOrders() }
    document.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      scheduledTimers.forEach(clearTimeout)
      document.removeEventListener('visibilitychange', handleFocus)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user?.id])

  // Headless: No redundant floating in-app banner UI
  return null
}

