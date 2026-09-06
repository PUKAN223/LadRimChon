import { Product } from '@/domain/product/product.model'

export interface ProductRepository {
  getProducts(shopId: string): Promise<Product[]>
  getProduct(id: string): Promise<Product | null>
  getProductsByCategory(shopId: string, categoryId: string): Promise<Product[]>
  getPopularProducts(): Promise<Product[]>
}
