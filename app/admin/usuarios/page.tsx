"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  UserX, 
  Users, 
  Calendar,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  ShieldCheck
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

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
  orderCount: number
  totalSpent: number
  lastLogin?: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Load users
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      loadUsers()
    }
  }, [session])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
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

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (response.ok) {
        loadUsers()
        toast({
          title: "Éxito",
          description: "Rol del usuario actualizado"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el usuario",
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
      day: "numeric"
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery))
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === "CUSTOMER").length,
    admins: users.filter(u => u.role === "ADMIN").length,
    newThisMonth: users.filter(u => {
      const userDate = new Date(u.createdAt)
      const now = new Date()
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
    }).length
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
              <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
              <p className="text-muted-foreground">
                Administra todos los usuarios registrados en Zulay C
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            {...staggerContainer}
          >
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                  <UserCheck className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.customers}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.admins}</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...staggerItem}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nuevos Este Mes</CardTitle>
                  <Calendar className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.newThisMonth}</div>
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
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="CUSTOMER">Clientes</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Users Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  Lista completa de usuarios registrados
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
                        <TableHead>Usuario</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Total Gastado</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === "ADMIN" ? "default" : "secondary"}
                              className={user.role === "ADMIN" ? "bg-purple-500" : ""}
                            >
                              {user.role === "ADMIN" ? (
                                <>
                                  <Shield className="w-3 h-3 mr-1" />
                                  Administrador
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Cliente
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.orderCount}</TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(user.totalSpent)}
                          </TableCell>
                          <TableCell>
                            {formatDate(user.createdAt)}
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
                                <DropdownMenuItem onClick={() => router.push(`/admin/usuarios/${user.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Perfil
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Cambiar Rol</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => updateUserRole(user.id, "CUSTOMER")}
                                  disabled={user.role === "CUSTOMER"}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Cliente
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateUserRole(user.id, "ADMIN")}
                                  disabled={user.role === "ADMIN"}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Administrador
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No se encontraron usuarios" : "No hay usuarios registrados"}
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