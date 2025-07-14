"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"

interface ReportData {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalUsers: number
    totalProducts: number
    revenueGrowth: number
    ordersGrowth: number
    usersGrowth: number
  }
  topProducts: {
    id: string
    name: string
    category: string
    soldQuantity: number
    revenue: number
  }[]
  salesByCategory: {
    category: string
    quantity: number
    revenue: number
    percentage: number
  }[]
  monthlyRevenue: {
    month: string
    revenue: number
    orders: number
  }[]
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState("30")

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Load report data
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      loadReportData()
    }
  }, [session, timePeriod])

  const loadReportData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/reports?period=${timePeriod}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los reportes",
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

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/admin/reports/export?period=${timePeriod}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `reporte-zulay-c-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Éxito",
          description: "Reporte exportado correctamente"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo exportar el reporte",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al exportar el reporte",
        variant: "destructive"
      })
    }
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
              <h1 className="text-3xl font-bold text-foreground">Reportes y Analíticas</h1>
              <p className="text-muted-foreground">
                Análisis detallado del rendimiento de Zulay C
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="365">Último año</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportReport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reportData ? (
            <>
              {/* Overview Stats */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                {...staggerContainer}
              >
                <motion.div {...staggerItem}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatPrice(reportData.overview.totalRevenue)}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {reportData.overview.revenueGrowth >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={reportData.overview.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatPercentage(reportData.overview.revenueGrowth)}
                        </span>
                        <span className="ml-1">vs período anterior</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div {...staggerItem}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.overview.totalOrders}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {reportData.overview.ordersGrowth >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={reportData.overview.ordersGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatPercentage(reportData.overview.ordersGrowth)}
                        </span>
                        <span className="ml-1">vs período anterior</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div {...staggerItem}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.overview.totalUsers}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {reportData.overview.usersGrowth >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={reportData.overview.usersGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatPercentage(reportData.overview.usersGrowth)}
                        </span>
                        <span className="ml-1">vs período anterior</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div {...staggerItem}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.overview.totalProducts}</div>
                      <div className="text-xs text-muted-foreground">
                        En catálogo actual
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Products */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Productos Más Vendidos
                      </CardTitle>
                      <CardDescription>
                        Top 5 productos por cantidad vendida
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Ingresos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.topProducts.map((product, index) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {product.category}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {product.soldQuantity}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatPrice(product.revenue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Sales by Category */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Ventas por Categoría
                      </CardTitle>
                      <CardDescription>
                        Distribución de ventas por categoría de producto
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reportData.salesByCategory.map((category) => (
                          <div key={category.category} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{category.category}</span>
                              <span>{category.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{category.quantity} unidades</span>
                              <span>{formatPrice(category.revenue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Monthly Revenue Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Tendencia de Ingresos
                    </CardTitle>
                    <CardDescription>
                      Ingresos y pedidos por mes en el período seleccionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mes</TableHead>
                          <TableHead>Ingresos</TableHead>
                          <TableHead>Pedidos</TableHead>
                          <TableHead>Promedio por Pedido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.monthlyRevenue.map((month) => (
                          <TableRow key={month.month}>
                            <TableCell className="font-medium">{month.month}</TableCell>
                            <TableCell>{formatPrice(month.revenue)}</TableCell>
                            <TableCell>{month.orders}</TableCell>
                            <TableCell>
                              {formatPrice(month.orders > 0 ? month.revenue / month.orders : 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No hay datos disponibles para el período seleccionado</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
} 