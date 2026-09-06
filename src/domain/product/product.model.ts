export interface Product {
  id: string
  shopId: string
  categoryId: string
  name: string
  description: string
  price: number
  imageUrl: string
  isAvailable: boolean
  stock: number | null // null = unlimited
  options: ProductOption[]
  tags: string[]
}

export interface ProductOption {
  id: string
  name: string
  required: boolean
  maxSelect: number
  choices: ProductChoice[]
}

export interface ProductChoice {
  id: string
  name: string
  priceAdd: number
}
