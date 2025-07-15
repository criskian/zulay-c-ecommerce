"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useToast } from "@/hooks/use-toast"
import { 
  fadeInUp, 
  fadeInLeft, 
  fadeInRight, 
  staggerContainer, 
  staggerItem, 
  buttonHover 
} from "@/lib/animations"

interface ProductVariant {
  id: string
  color: string
  size: string
  price: number
  originalPrice?: number
  stock: number
}

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
  variants: ProductVariant[]
}

export default function ProductPage() {
  const params = useParams()
  const productParam = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  
  const { dispatch } = useCart()
  const { addFavorite, removeFavorite, isFavorite: checkIsFavorite } = useFavorites()
  const { toast } = useToast()

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        // Try to fetch by slug first, then by id
        const response = await fetch(`/api/products/${productParam}`)
        
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
          // Set first available variant as selected
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0])
          }
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productParam])

  const isFavorite = checkIsFavorite(product?.id || "")

  if (loading) {
    return (
      <PageTransition className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </PageTransition>
    )
  }

  if (!product) {
    return (
      <PageTransition className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-6">El producto que buscas no existe o ha sido eliminado.</p>
            <Button asChild>
              <Link href="/productos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </Link>
            </Button>
          </motion.div>
        </main>
        <Footer />
      </PageTransition>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({
        title: "Selecciona una variante",
        description: "Por favor selecciona color y talla antes de agregar al carrito.",
        variant: "destructive",
      })
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: selectedVariant.price,
        image: product.images[0] || "/placeholder.svg",
        quantity: quantity,
        color: selectedVariant.color,
        size: selectedVariant.size,
      },
    })

    toast({
      title: "Agregado al carrito",
      description: `${product.name} ha sido agregado a tu carrito.`,
    })
  }

  const handleToggleFavorite = () => {
    const productForFavorites = {
      id: product.id,
      name: product.name,
      price: selectedVariant?.price || product.basePrice,
      image: product.images[0] || "/placeholder.svg",
      category: product.category.name,
      rating: 4.5, // Default rating
    }

    if (isFavorite) {
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

  const availableColors = [...new Set(product.variants.map(v => v.color))]
  const availableSizes = [...new Set(product.variants.map(v => v.size))]

  const handleColorChange = (color: string) => {
    const variant = product.variants.find(v => v.color === color && v.size === selectedVariant?.size)
    if (variant) {
      setSelectedVariant(variant)
    } else {
      // Find first available variant with this color
      const firstVariantWithColor = product.variants.find(v => v.color === color)
      if (firstVariantWithColor) {
        setSelectedVariant(firstVariantWithColor)
      }
    }
  }

  const handleSizeChange = (size: string) => {
    const variant = product.variants.find(v => v.size === size && v.color === selectedVariant?.color)
    if (variant) {
      setSelectedVariant(variant)
    } else {
      // Find first available variant with this size
      const firstVariantWithSize = product.variants.find(v => v.size === size)
      if (firstVariantWithSize) {
        setSelectedVariant(firstVariantWithSize)
      }
    }
  }

  const currentPrice = selectedVariant?.price || product.basePrice
  const originalPrice = selectedVariant?.originalPrice
  const hasDiscount = originalPrice && originalPrice > currentPrice
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.nav 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-muted-foreground mb-8"
          >
            <Link href="/" className="hover:text-foreground">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-foreground">Productos</Link>
            <span>/</span>
            <Link href={`/productos/categoria/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {product.isNew && (
                    <Badge className="absolute top-4 left-4 bg-green-500">
                      Nuevo
                    </Badge>
                  )}
                  {hasDiscount && (
                    <Badge className="absolute top-4 right-4 bg-red-500">
                      -{discountPercentage}%
                    </Badge>
                  )}
                </div>
                
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                          selectedImage === index ? "border-primary" : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} - Vista ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-muted-foreground">{product.category.name}</p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Color Selection */}
              {availableColors.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color: {selectedVariant?.color}</label>
                  <div className="flex gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          selectedVariant?.color === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Talla: {selectedVariant?.size}</label>
                  <div className="flex gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          selectedVariant?.size === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cantidad</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedVariant && (
                  <p className="text-sm text-muted-foreground">
                    {selectedVariant.stock} disponibles
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  className="flex-1"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Agregar al Carrito
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Envío gratis en pedidos superiores a $100.000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Garantía de 30 días</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-sm">Devoluciones fáciles</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
} 