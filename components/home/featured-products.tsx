"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useToast } from "@/hooks/use-toast"
import { staggerContainer, staggerItem, productCard, buttonHover, fadeInUp } from "@/lib/animations"
import { useRef } from "react"

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
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { toast } = useToast()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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

  const toggleFavorite = (product: (typeof featuredProducts)[0]) => {
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
        category: "destacados", // Categoría por defecto para productos destacados
      })
      toast({
        title: "¡Agregado a favoritos!",
        description: `${product.name} se agregó a tus favoritos`,
      })
    }
  }

  return (
    <section className="py-16 px-4 bg-muted/30" ref={ref}>
      <div className="container mx-auto">
        {/* Header con animación */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Productos Destacados
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubre nuestros productos más populares y las últimas tendencias
          </p>
        </motion.div>

        {/* Grid de productos con stagger */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={staggerItem}
              whileHover="hover"
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                    {/* Imagen con zoom effect */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
                      className="w-full h-full"
                    >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                        className="object-cover"
                      />
                    </motion.div>

                    {/* Overlay gradient on hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 to-transparent"
                  />

                    {/* Badges con animación */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isNew && (
                        <motion.div
                          initial={{ scale: 0, rotate: -12 }}
                          animate={{ scale: 1, rotate: -12 }}
                          transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Badge className="bg-green-500 hover:bg-green-600 shadow-md">Nuevo</Badge>
                        </motion.div>
                      )}
                    {product.originalPrice && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.7, type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Badge variant="destructive" className="shadow-md">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                        </motion.div>
                    )}
                  </div>

                    {/* Botón de favoritos - siempre visible */}
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(product)
                      }}
                      className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20 group"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 400, damping: 20 }}
                      title={isFavorite(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      <motion.div
                        animate={{
                          scale: isFavorite(product.id) ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.4, type: "spring" }}
                      >
                        <Heart 
                          className={`w-5 h-5 transition-all duration-300 ${
                            isFavorite(product.id) 
                              ? 'fill-red-500 text-red-500 drop-shadow-sm' 
                              : 'text-gray-600 hover:text-red-500 group-hover:scale-110'
                          }`}
                        />
                      </motion.div>
                      
                      {/* Efecto de brillo cuando es favorito */}
                      {isFavorite(product.id) && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-red-500/10"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0, 0.3]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.button>



                    {/* Quick Add to Cart - slide up from bottom */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="absolute bottom-3 left-3 right-3"
                    >
                      <motion.div
                        variants={buttonHover}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button 
                          className="w-full shadow-lg backdrop-blur-sm" 
                          size="sm" 
                          onClick={() => addToCart(product)}
                        >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                          Agregar al Carrito
                    </Button>
                      </motion.div>
                    </motion.div>
                </div>

                  {/* Contenido del producto */}
                  <motion.div 
                    className="p-4"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                  <Link href={`/productos/${product.id}`}>
                      <motion.h3 
                        className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                      {product.name}
                      </motion.h3>
                  </Link>

                    {/* Rating stars con animación stagger */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + i * 0.05 + 1, type: "spring", stiffness: 500, damping: 30 }}
                          >
                        <Star
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                          </motion.div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>

                    {/* Precios con animación */}
                    <motion.div 
                      className="flex items-center gap-2 mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 1.2, duration: 0.4 }}
                    >
                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    </motion.div>

                    {/* Colores con stagger */}
                    <motion.div 
                      className="flex flex-wrap gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 1.4, duration: 0.4 }}
                    >
                      {product.colors.slice(0, 3).map((color, colorIndex) => (
                        <motion.div
                          key={color}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + colorIndex * 0.05 + 1.5, type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Badge variant="outline" className="text-xs">
                        {color}
                      </Badge>
                        </motion.div>
                    ))}
                    {product.colors.length > 3 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 1.7, type: "spring", stiffness: 500, damping: 30 }}
                        >
                      <Badge variant="outline" className="text-xs">
                        +{product.colors.length - 3}
                      </Badge>
                        </motion.div>
                    )}
                    </motion.div>
                  </motion.div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center mt-12"
        >
          <motion.div
            variants={buttonHover}
            whileHover="hover"
            whileTap="tap"
          >
            <Button asChild size="lg" variant="outline" className="px-8 py-3 text-base shadow-md">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
