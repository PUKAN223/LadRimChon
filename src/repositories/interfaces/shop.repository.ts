import { Shop } from '@/domain/shop/shop.model'

export interface ShopRepository {
  getShops(): Promise<Shop[]>
  getShop(id: string): Promise<Shop | null>
  getShopsByCategory(category: string): Promise<Shop[]>
  getFeaturedShops(): Promise<Shop[]>
}
