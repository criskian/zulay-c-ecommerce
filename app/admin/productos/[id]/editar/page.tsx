"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, X, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import { ImageUpload } from "@/components/forms/image-upload"

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
  isActive: boolean
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
  }
  variants: ProductVariant[]
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
    categoryId: "",
    isNew: false,
    isFeatured: false,
    isActive: true,
    images: [] as string[]
  })

  const [variants, setVariants] = useState<ProductVariant[]>([])

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Load product and categories
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      loadProductAndCategories()
    }
  }, [session, params.id])

  const loadProductAndCategories = async () => {
    try {
      setLoading(true)
      
      // Load product
      const productResponse = await fetch(`/api/admin/products/${params.id}`)
      if (!productResponse.ok) {
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive"
        })
        router.push("/admin/productos")
        return
      }
      
      const productData = await productResponse.json()
      setProduct(productData)
      
      // Set form data
      setFormData({
        name: productData.name,
        slug: productData.slug,
        description: productData.description || "",
        basePrice: productData.basePrice,
        categoryId: productData.categoryId,
        isNew: productData.isNew,
        isFeatured: productData.isFeatured,
        isActive: productData.isActive,
        images: productData.images || []
      })
      
      setVariants(productData.variants || [])

      // Load categories
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ))
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      color: "",
      size: "",
      price: formData.basePrice,
      originalPrice: undefined,
      stock: 0
    }
    setVariants(prev => [...prev, newVariant])
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate form
      if (!formData.name.trim()) {
        toast({
          title: "Error de validación",
          description: "El nombre del producto es requerido",
          variant: "destructive"
        })
        return
      }

      if (!formData.categoryId) {
        toast({
          title: "Error de validación", 
          description: "La categoría es requerida",
          variant: "destructive"
        })
        return
      }

      if (variants.length === 0) {
        toast({
          title: "Error de validación",
          description: "El producto debe tener al menos una variante",
          variant: "destructive"
        })
        return
      }

      // Validate variants
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        if (!variant.color.trim() || !variant.size.trim()) {
          toast({
            title: "Error de validación",
            description: `La variante ${i + 1} debe tener color y talla`,
            variant: "destructive"
          })
          return
        }
      }

      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          variants: variants.map(v => ({
            ...v,
            price: Number(v.price),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
            stock: Number(v.stock)
          }))
        })
      })

      if (response.ok) {
        toast({
          title: "Producto actualizado",
          description: "Los cambios se han guardado correctamente"
        })
        router.push("/admin/productos")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error al guardar",
          description: errorData.error || "No se pudo actualizar el producto",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
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
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <Button asChild>
              <a href="/admin/productos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </a>
            </Button>
          </div>
        </main>
        <Footer />
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/admin/productos")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Editar Producto</h1>
                <p className="text-muted-foreground">{product.name}</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Información Básica</CardTitle>
                    <CardDescription>
                      Información general del producto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Producto *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="Ej: Zapatos Elegantes Negros"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="zapatos-elegantes-negros"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción detallada del producto..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basePrice">Precio Base</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          value={formData.basePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoría *</Label>
                        <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes del Producto</CardTitle>
                    <CardDescription>
                      Sube las imágenes que se mostrarán en la tienda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                      maxImages={6}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Variants */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Variantes del Producto</CardTitle>
                        <CardDescription>
                          Define las diferentes opciones de color, talla y precio
                        </CardDescription>
                      </div>
                      <Button onClick={addVariant} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Variante
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Variante {index + 1}</h4>
                          {variants.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Color *</Label>
                            <Input
                              value={variant.color}
                              onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                              placeholder="Negro"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Talla *</Label>
                            <Input
                              value={variant.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              placeholder="M, 38, etc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Precio</Label>
                            <Input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Precio Original (opcional)</Label>
                          <Input
                            type="number"
                            value={variant.originalPrice || ""}
                            onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Precio antes de descuento"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Estado del Producto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isActive">Producto Activo</Label>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isFeatured">Producto Destacado</Label>
                      <Switch
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isNew">Producto Nuevo</Label>
                      <Switch
                        id="isNew"
                        checked={formData.isNew}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total de Variantes:</span>
                      <Badge variant="secondary">{variants.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Stock Total:</span>
                      <Badge variant="secondary">
                        {variants.reduce((total, variant) => total + variant.stock, 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Imágenes:</span>
                      <Badge variant="secondary">{formData.images.length}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
} 