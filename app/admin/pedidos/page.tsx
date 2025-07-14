"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Download
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: string
  paymentStatus: string
  totalAmount: number
  itemCount: number
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
}

const ORDER_STATUSES = {
  PENDING: { label: "Pendiente", color: "bg-yellow-500" },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-500" },
  PROCESSING: { label: "Procesando", color: "bg-purple-500" },
  SHIPPED: { label: "Enviado", color: "bg-orange-500" },
  DELIVERED: { label: "Entregado", color: "bg-green-500" },
  CANCELLED: { label: "Cancelado", color: "bg-red-500" },
  RETURNED: { label: "Devuelto", color: "bg-gray-500" }
}

const PAYMENT_STATUSES = {
  PENDING: { label: "Pendiente", color: "bg-yellow-500" },
  PAID: { label: "Pagado", color: "bg-green-500" },
  FAILED: { label: "Fallido", color: "bg-red-500" },
  REFUNDED: { label: "Reembolsado", color: "bg-gray-500" }
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Load orders
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      loadOrders()
    }
  }, [session])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        loadOrders()
        toast({
          title: "Éxito",
          description: "Estado del pedido actualizado"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el pedido",
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "PENDING").length,
    processing: orders.filter(o => o.status === "PROCESSING").length,
    shipped: orders.filter(o => o.status === "SHIPPED").length,
    revenue: orders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.totalAmount, 0)
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
              <h1 className="text-3xl font-bold text-foreground">Gestión de Pedidos</h1>
              <p className="text-muted-foreground">
                Administra todos los pedidos de Zulay C
              </p>
            </div>
            <Button onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Reporte
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
            {...staggerContainer}
          >
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Procesando</CardTitle>
                  <AlertCircle className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.processing}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enviados</CardTitle>
                  <Truck className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.shipped}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
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
                placeholder="Buscar por número de pedido, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado del pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(ORDER_STATUSES).map(([key, status]) => (
                  <SelectItem key={key} value={key}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado del pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pagos</SelectItem>
                {Object.entries(PAYMENT_STATUSES).map(([key, status]) => (
                  <SelectItem key={key} value={key}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Orders Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
                <CardDescription>
                  Lista completa de pedidos realizados
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
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Pago</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.customerEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{order.itemCount} productos</TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color} text-white`}
                            >
                              {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]?.color} text-white`}
                            >
                              {PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]?.label || order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(order.createdAt)}
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
                                <DropdownMenuItem onClick={() => router.push(`/admin/pedidos/${order.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                                {Object.entries(ORDER_STATUSES).map(([key, status]) => (
                                  <DropdownMenuItem 
                                    key={key}
                                    onClick={() => updateOrderStatus(order.id, key)}
                                  >
                                    {status.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No se encontraron pedidos" : "No hay pedidos registrados"}
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