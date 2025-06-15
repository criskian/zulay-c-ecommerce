"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

const featuredProducts = [
  {
    id: "1",
    name: "Zapatos Elegantes Negros",
    price: 189000,
    originalPrice: 220000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.8,
    reviews: 24,
    isNew: true,
    colors: ["Negro", "Café"],
    sizes: ["36", "37", "38", "39", "40"],
  },
  {
    id: "2",
    name: "Correa de Cuero Premium",
    price: 85000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.9,
    reviews: 18,
    isNew: false,
    colors: ["Negro", "Café", "Marrón"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "3",
    name: "Camiseta Casual Blanca",
    price: 45000,
    originalPrice: 55000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.7,
    reviews: 32,
    isNew: false,
    colors: ["Blanco", "Negro", "Gris"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "4",
    name: "Zapatos Deportivos",
    price: 165000,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.6,
    reviews: 15,
    isNew: true,
    colors: ["Blanco", "Negro"],
    sizes: ["36", "37", "38", "39", "40", "41"],
  },
]

export function FeaturedProducts() {
  const { dispatch } = useCart()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<string[]>([])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const addToCart = (product: (typeof featuredProducts)[0]) => {
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

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Productos Destacados</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubre nuestros productos más populares y las últimas tendencias
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
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
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                  </div>

                  {/* Quick Add to Cart */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="w-full" size="sm" onClick={() => addToCart(product)}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>

                <div className="p-4">
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

                  <div className="flex flex-wrap gap-1">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
