import { ShopRepository } from '@/repositories/interfaces/shop.repository'
import { ProductRepository } from '@/repositories/interfaces/product.repository'
import { OrderRepository } from '@/repositories/interfaces/order.repository'
import { LocalStorageShopAdapter } from '@/repositories/adapters/local-storage/shop.adapter'
import { LocalStorageProductAdapter } from '@/repositories/adapters/local-storage/product.adapter'
import { LocalStorageOrderAdapter } from '@/repositories/adapters/local-storage/order.adapter'

// Singleton instances
let shopRepo: ShopRepository | null = null
let productRepo: ProductRepository | null = null
let orderRepo: OrderRepository | null = null

export function getShopRepository(): ShopRepository {
  if (!shopRepo) shopRepo = new LocalStorageShopAdapter()
  return shopRepo
}

export function getProductRepository(): ProductRepository {
  if (!productRepo) productRepo = new LocalStorageProductAdapter()
  return productRepo
}

export function getOrderRepository(): OrderRepository {
  if (!orderRepo) orderRepo = new LocalStorageOrderAdapter()
  return orderRepo
}
