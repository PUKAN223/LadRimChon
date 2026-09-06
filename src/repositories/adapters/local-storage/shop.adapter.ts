import { Shop } from '@/domain/shop/shop.model'
import { ShopRepository } from '@/repositories/interfaces/shop.repository'
import { SEED_SHOPS } from './seed.data'

const STORAGE_KEY = 'ladrimchon_shops_v8'

export class LocalStorageShopAdapter implements ShopRepository {
  private getShopsFromStorage(): Shop[] {
    if (typeof window === 'undefined') return SEED_SHOPS
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        this.seedShops()
        return SEED_SHOPS
      }
      const parsed = JSON.parse(data) as Shop[]
      if (!Array.isArray(parsed) || parsed.length < SEED_SHOPS.length) {
        this.seedShops()
        return SEED_SHOPS
      }
      return parsed
    } catch {
      return SEED_SHOPS
    }
  }

  private seedShops(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SHOPS))
    } catch (e) {
      console.warn('LocalStorage seed error:', e)
    }
  }

  async getShops(): Promise<Shop[]> {
    return this.getShopsFromStorage()
  }

  async getShop(id: string): Promise<Shop | null> {
    const shops = this.getShopsFromStorage()
    return shops.find((s) => s.id === id) ?? null
  }

  async getShopsByCategory(category: string): Promise<Shop[]> {
    const shops = this.getShopsFromStorage()
    return shops.filter((s) => s.category === category)
  }

  async getFeaturedShops(): Promise<Shop[]> {
    const shops = this.getShopsFromStorage()
    return shops.filter((s) => s.isOpen).sort((a, b) => b.rating - a.rating).slice(0, 4)
  }
}
