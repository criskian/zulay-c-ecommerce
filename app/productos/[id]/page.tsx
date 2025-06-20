"use client"

import { useState } from "react"
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
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { 
  fadeInUp, 
  fadeInLeft, 
  fadeInRight, 
  staggerContainer, 
  staggerItem, 
  buttonHover 
} from "@/lib/animations"

// Mock data - En el futuro vendría de la base de datos
const mockProducts = {
  "1": {
    id: "1",
    name: "Zapatos Elegantes Negros",
    price: 189000,
    originalPrice: 220000,
    description: "Zapatos elegantes de cuero genuino, perfectos para ocasiones especiales. Diseño clásico con detalles modernos que combinan comodidad y estilo.",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600&text=Vista+2",
      "/placeholder.svg?height=600&width=600&text=Vista+3",
      "/placeholder.svg?height=600&width=600&text=Vista+4"
    ],
    rating: 4.8,
    reviews: 24,
    isNew: true,
    colors: [
      { name: "Negro", value: "#272218", available: true },
      { name: "Café", value: "#8B4513", available: true },
      { name: "Marrón", value: "#A0522D", available: false }
    ],
    sizes: [
      { size: "36", available: true },
      { size: "37", available: true },
      { size: "38", available: true },
      { size: "39", available: false },
      { size: "40", available: true }
    ],
    features: [
      "Cuero genuino de alta calidad",
      "Suela antideslizante",
      "Plantilla acolchada",
      "Resistente al agua"
    ],
    stock: 15,
    category: "zapatos"
  },
  "2": {
    id: "2",
    name: "Correa de Cuero Premium",
    price: 85000,
    originalPrice: undefined,
    description: "Correa de cuero premium con hebilla metálica. Ideal para looks formales y casuales.",
    images: [
      "/placeholder.svg?height=600&width=600&text=Correa",
      "/placeholder.svg?height=600&width=600&text=Detalle"
    ],
    rating: 4.9,
    reviews: 18,
    isNew: false,
    colors: [
      { name: "Negro", value: "#272218", available: true },
      { name: "Café", value: "#8B4513", available: true },
      { name: "Marrón", value: "#A0522D", available: true }
    ],
    sizes: [
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: true }
    ],
    features: [
      "Cuero 100% genuino",
      "Hebilla de acero inoxidable",
      "Diseño versátil",
      "Garantía de 2 años"
    ],
    stock: 8,
    category: "correas"
  },
  "3": {
    id: "3",
    name: "Camiseta Casual Blanca",
    price: 45000,
    originalPrice: 55000,
    description: "Camiseta casual de algodón premium. Perfecta para el día a día con un corte moderno y cómodo.",
    images: [
      "/placeholder.svg?height=600&width=600&text=Camiseta",
      "/placeholder.svg?height=600&width=600&text=Frente",
      "/placeholder.svg?height=600&width=600&text=Espalda"
    ],
    rating: 4.7,
    reviews: 32,
    isNew: false,
    colors: [
      { name: "Blanco", value: "#FFFFFF", available: true },
      { name: "Negro", value: "#272218", available: true },
      { name: "Gris", value: "#808080", available: true }
    ],
    sizes: [
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: false }
    ],
    features: [
      "100% algodón premium",
      "Corte regular fit",
      "Preencogido",
      "Fácil cuidado"
    ],
    stock: 25,
    category: "camisetas"
  },
  "4": {
    id: "4",
    name: "Zapatos Deportivos",
    price: 165000,
    originalPrice: undefined,
    description: "Zapatos deportivos con tecnología de amortiguación avanzada. Ideales para running y actividades deportivas.",
    images: [
      "/placeholder.svg?height=600&width=600&text=Deportivos",
      "/placeholder.svg?height=600&width=600&text=Lateral",
      "/placeholder.svg?height=600&width=600&text=Suela"
    ],
    rating: 4.6,
    reviews: 15,
    isNew: true,
    colors: [
      { name: "Blanco", value: "#FFFFFF", available: true },
      { name: "Negro", value: "#272218", available: true }
    ],
    sizes: [
      { size: "36", available: true },
      { size: "37", available: true },
      { size: "38", available: true },
      { size: "39", available: true },
      { size: "40", available: true },
      { size: "41", available: false }
    ],
    features: [
      "Tecnología de amortiguación",
      "Transpirable",
      "Suela de alta tracción",
      "Diseño deportivo"
    ],
    stock: 12,
    category: "zapatos"
  },
  "7": {
    id: "7",
    name: "Zapatos Casuales Oferta",
    price: 120000,
    originalPrice: 160000,
    description: "Zapatos casuales cómodos perfectos para el día a día. Ahora con descuento especial por tiempo limitado.",
    images: [
      "/placeholder.svg?height=600&width=600&text=Casuales",
      "/placeholder.svg?height=600&width=600&text=Vista+Lateral",
      "/placeholder.svg?height=600&width=600&text=Detalle"
    ],
    rating: 4.5,
    reviews: 22,
    isNew: false,
    colors: [
      { name: "Café", value: "#8B4513", available: true },
      { name: "Negro", value: "#272218", available: true }
    ],
    sizes: [
      { size: "36", available: true },
      { size: "37", available: true },
      { size: "38", available: true },
      { size: "39", available: true },
      { size: "40", available: false }
    ],
    features: [
      "Diseño casual versátil",
      "Material de alta calidad",
      "Suela cómoda y duradera",
      "Perfecto para uso diario"
    ],
    stock: 18,
    category: "zapatos"
  },
  "8": {
    id: "8",
    name: "Correa Elegante Descuento",
    price: 60000,
    originalPrice: 80000,
    description: "Correa elegante de cuero genuino con descuento especial. Perfecta para looks formales y ocasionales.",
    images: [
      "/placeholder.svg?height=600&width=600&text=Correa+Elegante",
      "/placeholder.svg?height=600&width=600&text=Hebilla"
    ],
    rating: 4.3,
    reviews: 16,
    isNew: false,
    colors: [
      { name: "Negro", value: "#272218", available: true },
      { name: "Marrón", value: "#A0522D", available: true }
    ],
    sizes: [
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: true }
    ],
    features: [
      "Cuero genuino premium",
      "Hebilla metálica resistente",
      "Diseño elegante y versátil",
      "Precio especial por tiempo limitado"
    ],
    stock: 10,
    category: "correas"
  }
}

const relatedProducts = [
  { id: "7", name: "Zapatos Casuales Oferta", price: 120000, image: "/placeholder.svg?height=300&width=300", rating: 4.5 },
  { id: "8", name: "Correa Elegante Descuento", price: 60000, image: "/placeholder.svg?height=300&width=300", rating: 4.3 },
  { id: "4", name: "Zapatos Deportivos", price: 165000, image: "/placeholder.svg?height=300&width=300", rating: 4.6 }
]

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const product = mockProducts[productId as keyof typeof mockProducts]
  
  const { dispatch } = useCart()
  const { toast } = useToast()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

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
              <Link href="/productos">Volver a productos</Link>
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
    if (!selectedSize) {
      toast({
        title: "Selecciona una talla",
        description: "Por favor selecciona una talla antes de agregar al carrito",
        variant: "destructive",
      })
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: selectedSize,
        color: product.colors[selectedColor].name,
        quantity: quantity,
      },
    })

    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} se agregó a tu carrito`,
    })
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
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
              <Link href="/productos" className="hover:text-foreground transition-colors">Productos</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">{product.name}</span>
            </motion.nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Galería de Imágenes */}
            <motion.div
              variants={fadeInLeft}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {/* Imagen Principal */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <motion.div
                      initial={{ scale: 0, rotate: -12 }}
                      animate={{ scale: 1, rotate: -12 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                    >
                      <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>
                    </motion.div>
                  )}
                  {product.originalPrice && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 500 }}
                    >
                      <Badge variant="destructive">
                        -{Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}%
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} vista ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Información del Producto */}
            <motion.div
              variants={fadeInRight}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              {/* Header */}
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                <motion.h1 variants={staggerItem} className="text-3xl font-bold mb-2">
                  {product.name}
                </motion.h1>
                
                {/* Rating */}
                <motion.div variants={staggerItem} className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.5, type: "spring", stiffness: 500 }}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reseñas)
                  </span>
                </motion.div>

                {/* Precio */}
                <motion.div variants={staggerItem} className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice || 0)}
                    </span>
                  )}
                </motion.div>

                {/* Stock */}
                <motion.div variants={staggerItem}>
                  <Badge variant="outline" className="mb-4">
                    <Zap className="h-3 w-3 mr-1" />
                    {product.stock} disponibles
                  </Badge>
                </motion.div>
              </motion.div>

              {/* Descripción */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </motion.div>

              {/* Características */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <h3 className="font-semibold">Características:</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 1 }}
                      className="flex items-center text-sm text-muted-foreground"
                    >
                      <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <Separator />

              {/* Selección de Color */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="space-y-3"
              >
                <h3 className="font-semibold">Color:</h3>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(index)}
                      disabled={!color.available}
                      className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                        selectedColor === index ? "border-primary scale-110" : "border-gray-300"
                      } ${!color.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedColor === index && (
                        <motion.div
                          layoutId="selectedColor"
                          className="absolute inset-0 rounded-full border-2 border-primary"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Seleccionado: {product.colors[selectedColor].name}
                </p>
              </motion.div>

              {/* Selección de Talla */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="space-y-3"
              >
                <h3 className="font-semibold">Talla:</h3>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((sizeOption, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: sizeOption.available ? 1.05 : 1 }}
                      whileTap={{ scale: sizeOption.available ? 0.95 : 1 }}
                      onClick={() => sizeOption.available && setSelectedSize(sizeOption.size)}
                      disabled={!sizeOption.available}
                      className={`py-2 px-3 border rounded-md text-sm transition-all ${
                        selectedSize === sizeOption.size
                          ? "border-primary bg-primary text-primary-foreground"
                          : sizeOption.available
                          ? "border-gray-300 hover:border-primary"
                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {sizeOption.size}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Cantidad */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="space-y-3"
              >
                <h3 className="font-semibold">Cantidad:</h3>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Botones de Acción */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="space-y-3"
              >
                <div className="flex gap-3">
                  <motion.div
                    variants={buttonHover}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex-1"
                  >
                    <Button 
                      onClick={handleAddToCart}
                      size="lg" 
                      className="w-full text-base"
                    >
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Agregar al Carrito
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="px-4"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </motion.div>
                </div>

                <Button variant="outline" size="lg" className="w-full">
                  Comprar Ahora
                </Button>
              </motion.div>

              {/* Información de Envío */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
              >
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="h-4 w-4 text-green-600" />
                      <span>Envío gratis en compras sobre $100.000</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Compra 100% segura</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <RotateCcw className="h-4 w-4 text-orange-600" />
                      <span>30 días para devoluciones</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Productos Relacionados */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-8">Productos Relacionados</h2>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {relatedProducts.map((relatedProduct) => (
                <motion.div key={relatedProduct.id} variants={staggerItem}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <Link href={`/productos/${relatedProduct.id}`}>
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">{formatPrice(relatedProduct.price)}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{relatedProduct.rating}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
} 