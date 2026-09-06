import { Product } from '@/domain/product/product.model'
import { ProductRepository } from '@/repositories/interfaces/product.repository'
import { SEED_PRODUCTS } from './seed.data'

const STORAGE_KEY = 'ladrimchon_products_v5'

export class LocalStorageProductAdapter implements ProductRepository {
  private getProductsFromStorage(): Product[] {
    if (typeof window === 'undefined') return SEED_PRODUCTS
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        this.seedProducts()
        return SEED_PRODUCTS
      }
      const parsed = JSON.parse(data) as Product[]
      if (!Array.isArray(parsed) || parsed.length < SEED_PRODUCTS.length) {
        this.seedProducts()
        return SEED_PRODUCTS
      }
      return parsed
    } catch {
      return SEED_PRODUCTS
    }
  }

  private seedProducts(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS))
    } catch (e) {
      console.warn('LocalStorage product seed error:', e)
    }
  }

  async getProducts(shopId: string): Promise<Product[]> {
    const products = this.getProductsFromStorage()
    return products.filter((p) => p.shopId === shopId)
  }

  async getProduct(id: string): Promise<Product | null> {
    const products = this.getProductsFromStorage()
    return products.find((p) => p.id === id) ?? null
  }

  async getProductsByCategory(shopId: string, categoryId: string): Promise<Product[]> {
    const products = this.getProductsFromStorage()
    return products.filter((p) => p.shopId === shopId && p.categoryId === categoryId)
  }

  async getPopularProducts(): Promise<Product[]> {
    const products = this.getProductsFromStorage()
    return products.filter((p) => p.tags?.includes('popular') || p.tags?.includes('bestseller')).slice(0, 8)
  }
}
