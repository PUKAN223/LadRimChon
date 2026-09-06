export interface Shop {
  id: string
  shopNumber?: number
  name: string
  description: string
  imageUrl: string
  coverUrl: string
  category: ShopCategory
  zone: string
  isOpen: boolean
  rating: number
  reviewCount: number
  preparationTime: number // minutes
  tags: string[]
  menuCategories: MenuCategory[]
}

export type ShopCategory =
  | 'thai'
  | 'noodle'
  | 'rice'
  | 'drink'
  | 'dessert'
  | 'snack'
  | 'isaan'
  | 'seafood'
  | 'international'

export interface MenuCategory {
  id: string
  name: string
  shopId: string
}
