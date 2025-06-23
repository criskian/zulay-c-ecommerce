import { 
  User, 
  Product, 
  ProductVariant, 
  Category, 
  Cart, 
  CartItem, 
  Order, 
  OrderItem, 
  Review, 
  Favorite,
  OrderStatus,
  PaymentStatus,
  CartStatus
} from '@prisma/client'

// ===============================================
// PRODUCT TYPES
// ===============================================

export type ProductWithDetails = Product & {
  category: Category
  variants: ProductVariant[]
  reviews: Review[]
  _count: {
    reviews: number
    favorites: number
  }
}

export type ProductVariantWithStock = ProductVariant & {
  product: Product
  _count: {
    cartItems: number
    orderItems: number
  }
}

// ===============================================
// CART TYPES
// ===============================================

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product
    variant: ProductVariant
  })[]
  user?: User
}

export type CartItemWithDetails = CartItem & {
  product: Product
  variant: ProductVariant
}

// ===============================================
// ORDER TYPES
// ===============================================

export type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: Product
    variant: ProductVariant
  })[]
  user: User
}

export type OrderItemWithDetails = OrderItem & {
  product: Product
  variant: ProductVariant
}

// ===============================================
// USER TYPES
// ===============================================

export type UserWithStats = User & {
  _count: {
    orders: number
    reviews: number
    favorites: number
  }
}

// ===============================================
// REVIEW TYPES
// ===============================================

export type ReviewWithDetails = Review & {
  user: Pick<User, 'id' | 'name' | 'image'>
  product: Pick<Product, 'id' | 'name' | 'slug'>
}

// ===============================================
// CATEGORY TYPES
// ===============================================

export type CategoryWithProducts = Category & {
  products: Product[]
  _count: {
    products: number
  }
}

// ===============================================
// UTILITY TYPES
// ===============================================

export type CreateProductData = {
  name: string
  slug: string
  description?: string
  basePrice: number
  images: string[]
  specifications?: Record<string, any>
  categoryId: string
  isNew?: boolean
  isFeatured?: boolean
  variants: {
    sku: string
    color: string
    size: string
    price: number
    originalPrice?: number
    stock: number
    imageIndex?: number
  }[]
}

export type CreateOrderData = {
  userId: string
  items: {
    productId: string
    variantId: string
    quantity: number
    unitPrice: number
  }[]
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  billingAddress?: {
    name: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  subtotal: number
  shippingCost: number
  taxAmount?: number
  discountAmount?: number
  totalAmount: number
  customerNotes?: string
  paymentMethod?: string
}

export type UpdateInventoryData = {
  variantId: string
  quantity: number
  operation: 'add' | 'subtract' | 'set'
}

// ===============================================
// FILTER TYPES
// ===============================================

export type ProductFilters = {
  categoryId?: string
  priceMin?: number
  priceMax?: number
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
  isNew?: boolean
  isFeatured?: boolean
  search?: string
}

export type OrderFilters = {
  status?: OrderStatus[]
  paymentStatus?: PaymentStatus[]
  dateFrom?: Date
  dateTo?: Date
  userId?: string
}

// ===============================================
// API RESPONSE TYPES
// ===============================================

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export type PaginatedResponse<T> = {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ===============================================
// FORM TYPES
// ===============================================

export type CheckoutFormData = {
  email?: string
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
  }
  billingAddress?: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: 'credit_card' | 'debit_card' | 'pse' | 'cash_on_delivery'
  cardDetails?: {
    number: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    name: string
  }
  customerNotes?: string
  newsletter?: boolean
}

// ===============================================
// EXPORT ENUMS
// ===============================================

export { OrderStatus, PaymentStatus, CartStatus } 