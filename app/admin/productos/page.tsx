"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"

interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  stock: number
  isActive: boolean
  isNew: boolean
  isFeatured: boolean
  createdAt: string
  variantCount: number
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Load products
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      loadProducts()
    }
  }, [session])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const toggleProductStatus = async (productId: string) => {
    try {
      // Obtener el producto actual para determinar el nuevo estado
      const currentProduct = products.find(p => p.id === productId)
      if (!currentProduct) return

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentProduct.isActive
        })
      })
      
      if (response.ok) {
        loadProducts()
        toast({
          title: "Éxito",
          description: `Producto ${!currentProduct.isActive ? 'activado' : 'desactivado'} correctamente`
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "No se pudo actualizar el producto",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
  }

  const deleteProduct = async (productId: string) => {
    // Obtener información del producto para mostrar en la confirmación
    const productToDelete = products.find(p => p.id === productId)
    if (!productToDelete) return

    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar el producto "${productToDelete.name}"?\n\n` +
      `Esta acción no se puede deshacer y eliminará:\n` +
      `- El producto y todas sus variantes\n` +
      `- Todo el inventario asociado\n\n` +
      `¿Continuar con la eliminación?`
    )
    
    if (!confirmed) return
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadProducts()
        toast({
          title: "Producto eliminado",
          description: `"${productToDelete.name}" ha sido eliminado correctamente`
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error al eliminar",
          description: errorData.error || "No se pudo eliminar el producto",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && product.isActive) ||
      (filterStatus === "inactive" && !product.isActive)
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    featured: products.filter(p => p.isFeatured).length,
    lowStock: products.filter(p => p.stock < 10).length
  }

  if (status === "loading" || !session) {
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

  if (session.user?.role !== "ADMIN") {
    return null
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Productos</h1>
              <p className="text-muted-foreground">
                Administra el catálogo de productos de Zulay C
              </p>
            </div>
            <Button onClick={() => router.push('/admin/productos/nuevo')}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            {...staggerContainer}
          >
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Destacados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.featured}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.lowStock}</div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                size="sm"
              >
                Activos
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
                size="sm"
              >
                Inactivos
              </Button>
            </div>
          </motion.div>

          {/* Products Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Productos ({filteredProducts.length})</CardTitle>
                <CardDescription>
                  Lista completa de productos en el catálogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Precio Base</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Variantes</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="flex gap-1 mt-1">
                                {product.isNew && (
                                  <Badge variant="secondary" className="text-xs">
                                    Nuevo
                                  </Badge>
                                )}
                                {product.isFeatured && (
                                  <Badge variant="default" className="text-xs">
                                    Destacado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{formatPrice(product.basePrice)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={product.stock < 10 ? "destructive" : "secondary"}
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.variantCount}</TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/productos/${product.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Producto
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/admin/productos/${product.id}/editar`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleProductStatus(product.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {product.isActive ? "Desactivar" : "Activar"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteProduct(product.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No se encontraron productos" : "No hay productos registrados"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
} 