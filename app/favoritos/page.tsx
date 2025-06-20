"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, Star, Clock, Package } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function FavoritosPage() {
  const { state: favorites, removeFavorite, clearFavorites } = useFavorites()
  const { dispatch } = useCart()

  const handleRemoveFavorite = (productId: string, productName: string) => {
    removeFavorite(productId)
    toast.success(`${productName} eliminado de favoritos`)
  }

  const handleAddToCart = (product: any) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: "M", // Talla por defecto
        color: "Negro", // Color por defecto
        quantity: 1
      }
    })
    toast.success(`${product.name} agregado al carrito`)
  }

  const handleClearAllFavorites = () => {
    clearFavorites()
    toast.success("Todos los favoritos han sido eliminados")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date)
  }

  if (favorites.itemCount === 0) {
    return (
      <PageTransition className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="border-b bg-muted/30">
            <div className="container mx-auto px-4 py-4">
              <motion.nav 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground"
              >
                <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">Mis Favoritos</span>
              </motion.nav>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-50 to-white py-8">
            <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md mx-auto"
            >
              <div className="mb-8">
                <Heart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Tu lista de favoritos está vacía
                </h1>
                <p className="text-gray-600 mb-8">
                  Agrega productos a tu lista de favoritos para encontrarlos fácilmente más tarde
                </p>
              </div>
              
              <div className="space-y-4">
                <Link href="/productos">
                  <Button size="lg" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Explorar Productos
                  </Button>
                </Link>
                
                <Link href="/ofertas">
                  <Button variant="outline" size="lg" className="w-full">
                    Ver Ofertas Especiales
                  </Button>
                </Link>
              </div>
            </motion.div>
            </div>
          </div>
        </main>
        <Footer />
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <motion.nav 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">Mis Favoritos</span>
            </motion.nav>
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-50 to-white py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mis Favoritos
              </h1>
              <p className="text-gray-600">
                {favorites.itemCount} producto{favorites.itemCount !== 1 ? 's' : ''} en tu lista
              </p>
            </div>
            
            {favorites.itemCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAllFavorites}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar todo
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {favorites.items.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Badge de categoría */}
                  <Badge 
                    variant="secondary" 
                    className="absolute top-3 left-3 bg-white/90 text-gray-700"
                  >
                    {product.category}
                  </Badge>
                  
                  {/* Botón de eliminar favorito */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white border-gray-200"
                    onClick={() => handleRemoveFavorite(product.id, product.name)}
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </Button>
                  
                  {/* Descuento si existe */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <Badge className="absolute bottom-3 left-3 bg-red-500 hover:bg-red-600">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.rating})
                        </span>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Fecha agregado */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Agregado {formatDate(product.addedAt)}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/productos/${product.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Ver detalles
                        </Button>
                      </Link>
                      
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action adicional */}
        {favorites.itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Buscas más productos?
              </h3>
              <p className="text-gray-600 mb-6">
                Explora nuestra colección completa y encuentra tu próximo producto favorito
              </p>
              <div className="space-y-3">
                <Link href="/productos">
                  <Button className="w-full">
                    Ver todos los productos
                  </Button>
                </Link>
                <Link href="/ofertas">
                  <Button variant="outline" className="w-full">
                    Ver ofertas especiales
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}