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

// Mock products data
const allProducts = [
  {
    id: "1",
    name: "Zapatos Elegantes Negros",
    price: 189000,
    originalPrice: 220000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.8,
    reviews: 24,
    category: "zapatos",
    sizes: ["36", "37", "38", "39", "40"],
    colors: ["Negro", "Café"],
    brand: "Zulay C",
    isNew: true,
  },
  {
    id: "2",
    name: "Correa de Cuero Premium",
    price: 85000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.9,
    reviews: 18,
    category: "correas",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Negro", "Café", "Marrón"],
    brand: "Premium",
    isNew: false,
  },
  {
    id: "3",
    name: "Camiseta Casual Blanca",
    price: 45000,
    originalPrice: 55000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.7,
    reviews: 32,
    category: "camisetas",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanco", "Negro", "Gris"],
    brand: "Classic",
    isNew: false,
  },
  {
    id: "4",
    name: "Zapatos Deportivos",
    price: 165000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.6,
    reviews: 15,
    category: "zapatos",
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: ["Blanco", "Negro"],
    brand: "Sport",
    isNew: true,
  },
  {
    id: "5",
    name: "Correa Casual Marrón",
    price: 65000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.5,
    reviews: 12,
    category: "correas",
    sizes: ["S", "M", "L"],
    colors: ["Marrón", "Negro"],
    brand: "Classic",
    isNew: false,
  },
  {
    id: "6",
    name: "Camiseta Polo Azul",
    price: 55000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.4,
    reviews: 8,
    category: "camisetas",
    sizes: ["M", "L", "XL"],
    colors: ["Azul", "Blanco"],
    brand: "Premium",
    isNew: false,
  },
  {
    id: "7",
    name: "Zapatos Casuales Oferta",
    price: 120000,
    originalPrice: 160000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.5,
    reviews: 22,
    category: "zapatos",
    sizes: ["36", "37", "38", "39", "40"],
    colors: ["Café", "Negro"],
    brand: "Zulay C",
    isNew: false,
    isOffer: true,
  },
  {
    id: "8", 
    name: "Correa Elegante Descuento",
    price: 60000,
    originalPrice: 80000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.3,
    reviews: 16,
    category: "correas",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Negro", "Marrón"],
    brand: "Premium",
    isNew: false,
    isOffer: true,
  },
]

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
}

export function ProductGrid({ viewMode, filters }: ProductGridProps) {
  const [products, setProducts] = useState(allProducts)
  const { dispatch } = useCart()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { toast } = useToast()

  useEffect(() => {
    let filteredProducts = [...allProducts]

    // Apply filters
    if (filters.category) {
      if (filters.category === "ofertas") {
        filteredProducts = filteredProducts.filter((p) => p.originalPrice && p.originalPrice > p.price)
      } else {
        filteredProducts = filteredProducts.filter((p) => p.category === filters.category)
      }
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
      )
    }

    if (filters.sizes.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.sizes.some((size) => filters.sizes.includes(size)))
    }

    if (filters.colors.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.colors.some((color) => filters.colors.includes(color)))
    }

    if (filters.brands.length > 0) {
      filteredProducts = filteredProducts.filter((p) => filters.brands.includes(p.brand))
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price-low":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
        filteredProducts.sort((a, b) => b.reviews - a.reviews)
        break
      case "newest":
      default:
        filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
    }

    setProducts(filteredProducts)
  }, [filters])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const addToCart = (product: (typeof allProducts)[0]) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: product.sizes[0],
        color: product.colors[0],
        quantity: 1,
      },
    })

    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó a tu carrito`,
    })
  }

  const toggleFavorite = (product: (typeof allProducts)[0]) => {
    const isCurrentlyFavorite = isFavorite(product.id)
    
    if (isCurrentlyFavorite) {
      removeFavorite(product.id)
      toast({
        title: "Eliminado de favoritos",
        description: `${product.name} se eliminó de tus favoritos`,
      })
    } else {
      addFavorite({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        rating: product.rating,
        category: product.category,
      })
      toast({
        title: "¡Agregado a favoritos!",
        description: `${product.name} se agregó a tus favoritos`,
      })
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No se encontraron productos con los filtros seleccionados.</p>
        <p className="text-sm text-muted-foreground mt-2">Intenta ajustar los filtros para ver más resultados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Mostrando {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
        }
      >
        {products.map((product) => (
          <Card
            key={product.id}
            className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${
              viewMode === "list" ? "flex" : ""
            }`}
          >
            <CardContent className="p-0">
              <div
                className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"}`}
              >
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>}
                  {product.originalPrice && (
                    <Badge variant="destructive">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(product)}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                    <Link href={`/productos/${product.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Quick Add to Cart - Grid View */}
                {viewMode === "grid" && (
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="w-full" size="sm" onClick={() => addToCart(product)}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                )}
              </div>

              <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <Link href={`/productos/${product.id}`}>
                  <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {product.colors.slice(0, 3).map((color) => (
                    <Badge key={color} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                  {product.colors.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.colors.length - 3}
                    </Badge>
                  )}
                </div>

                {/* List View Actions */}
                {viewMode === "list" && (
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => addToCart(product)}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/productos/${product.id}`}>Ver Detalles</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
