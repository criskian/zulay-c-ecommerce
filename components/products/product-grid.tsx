"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  images: string[]
  isNew: boolean
  isFeatured: boolean
  category: {
    name: string
    slug: string
  }
  variants: Array<{
    id: string
    color: string
    size: string
    price: number
    originalPrice?: number
    stock: number
  }>
}

interface ProductGridProps {
  viewMode: "grid" | "list"
  filters: {
    category: string
    priceRange: number[]
    sizes: string[]
    colors: string[]
    brands: string[]
    sortBy: string
  }
  searchQuery?: string
}

export function ProductGrid({ viewMode, filters, searchQuery }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { dispatch } = useCart()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { toast } = useToast()

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        if (filters.category && !searchQuery) {
          params.append('category', filters.category)
        }
        if (filters.priceRange[0] > 0) {
          params.append('minPrice', filters.priceRange[0].toString())
        }
        if (filters.priceRange[1] < 500000) {
          params.append('maxPrice', filters.priceRange[1].toString())
        }
        if (filters.sizes.length > 0) {
          params.append('sizes', filters.sizes.join(','))
        }
        if (filters.colors.length > 0) {
          params.append('colors', filters.colors.join(','))
        }
        params.append('sortBy', filters.sortBy)

        const response = await fetch(`/api/products?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        } else {
          console.error('Error fetching products')
          setProducts([])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, searchQuery])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const addToCart = (product: Product) => {
    // Use the first available variant for the cart
    const firstVariant = product.variants[0]
    if (!firstVariant) return

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: firstVariant.price,
        image: product.images[0] || "/placeholder.svg",
        quantity: 1,
        color: firstVariant.color,
        size: firstVariant.size,
      },
    })

    toast({
      title: "Agregado al carrito",
      description: `${product.name} ha sido agregado a tu carrito.`,
    })
  }

  const toggleFavorite = (product: Product) => {
    const productForFavorites = {
      id: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.images[0] || "/placeholder.svg",
      category: product.category.name,
      rating: 4.5, // Default rating
    }

    if (isFavorite(product.id)) {
      removeFavorite(product.id)
      toast({
        title: "Eliminado de favoritos",
        description: `${product.name} ha sido eliminado de tus favoritos.`,
      })
    } else {
      addFavorite(productForFavorites)
      toast({
        title: "Agregado a favoritos",
        description: `${product.name} ha sido agregado a tus favoritos.`,
      })
    }
  }

  // Helper function to get rating (mock for now)
  const getProductRating = () => {
    return (4.2 + Math.random() * 0.7).toFixed(1) // Random rating between 4.2-4.9
  }

  const getProductReviews = () => {
    return Math.floor(8 + Math.random() * 40) // Random reviews between 8-48
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-64 rounded-lg mb-4"></div>
            <div className="bg-muted h-4 rounded mb-2"></div>
            <div className="bg-muted h-4 rounded w-2/3 mb-2"></div>
            <div className="bg-muted h-6 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Eye className="h-12 w-12 mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `No hay productos que coincidan con "${searchQuery}"`
            : "Intenta ajustar los filtros para ver más productos"
          }
        </p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        {products.map((product) => {
          // Fix price calculations
          const availablePrices = product.variants.map(v => v.price).filter(p => p && !isNaN(p) && isFinite(p))
          const availableOriginalPrices = product.variants
            .map(v => v.originalPrice)
            .filter(p => p && !isNaN(p) && isFinite(p) && p > 0)
          
          const minPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : product.basePrice
          const maxOriginalPrice = availableOriginalPrices.length > 0 ? Math.max(...availableOriginalPrices) : null
          
          const hasOriginalPrice = maxOriginalPrice && maxOriginalPrice > minPrice
          const discount = hasOriginalPrice 
            ? Math.round(((maxOriginalPrice - minPrice) / maxOriginalPrice) * 100)
            : null

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {product.isNew && (
                      <Badge className="absolute top-2 left-2 bg-green-500">
                        Nuevo
                      </Badge>
                    )}
                    {discount && discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        -{discount}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(product)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isFavorite(product.id) ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.category.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground ml-1">
                          {getProductRating()} ({getProductReviews()})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(minPrice)}
                        </span>
                        {hasOriginalPrice && maxOriginalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(maxOriginalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/productos/${product.slug}`}>
                            Ver Detalles
                          </Link>
                        </Button>
                        <Button size="sm" onClick={() => addToCart(product)}>
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        // Fix price calculations
        const availablePrices = product.variants.map(v => v.price).filter(p => p && !isNaN(p) && isFinite(p))
        const availableOriginalPrices = product.variants
          .map(v => v.originalPrice)
          .filter(p => p && !isNaN(p) && isFinite(p) && p > 0)
        
        const minPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : product.basePrice
        const maxOriginalPrice = availableOriginalPrices.length > 0 ? Math.max(...availableOriginalPrices) : null
        
        const hasOriginalPrice = maxOriginalPrice && maxOriginalPrice > minPrice
        const discount = hasOriginalPrice 
          ? Math.round(((maxOriginalPrice - minPrice) / maxOriginalPrice) * 100)
          : null

        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <CardContent className="p-0">
              <div className="relative">
                <Link href={`/productos/${product.slug}`}>
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isNew && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Nuevo
                    </Badge>
                  )}
                  {discount && discount > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Heart Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(product)}
                  className="absolute top-2 right-2 text-white hover:text-red-500 bg-black/20 hover:bg-white/90"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite(product.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>

              <div className="p-4">
                <Link href={`/productos/${product.slug}`}>
                  <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {product.category.name}
                </p>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground ml-1">
                      {getProductRating()} ({getProductReviews()})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(minPrice)}
                    </span>
                    {hasOriginalPrice && maxOriginalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(maxOriginalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => addToCart(product)}
                  size="sm"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Agregar al Carrito
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
