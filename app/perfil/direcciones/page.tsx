'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  MapPin, Plus, Edit3, Trash2, Save, X, 
  Home, Building, ArrowLeft, Check, Star,
  Navigation, Phone, User
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import Image from 'next/image'
import { fadeInUp, staggerContainer, fadeInLeft } from '@/lib/animations'

// Departamentos de Colombia
const colombianStates = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
  'Vaupés', 'Vichada'
]

// Tipos de dirección
const addressTypes = [
  { value: 'home', label: 'Casa', icon: Home },
  { value: 'work', label: 'Trabajo', icon: Building },
  { value: 'other', label: 'Otro', icon: MapPin },
]

// Schema de validación
const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other'], {
    required_error: 'Selecciona un tipo de dirección'
  }),
  title: z.string()
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(50, 'El título no puede exceder 50 caracteres'),
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos'),
  address: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  neighborhood: z.string()
    .min(2, 'El barrio debe tener al menos 2 caracteres')
    .max(100, 'El barrio no puede exceder 100 caracteres'),
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),
  state: z.string().min(1, 'Selecciona un departamento'),
  postalCode: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
})

type AddressFormData = z.infer<typeof addressSchema>

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  title: string
  fullName: string
  phone: string
  address: string
  neighborhood: string
  city: string
  state: string
  postalCode?: string
  instructions?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function DireccionesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Estados
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Form
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: 'home',
      title: '',
      fullName: '',
      phone: '',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      instructions: '',
      isDefault: false,
    }
  })

  // Redirect si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Cargar direcciones
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session?.user?.email) return

      try {
        const response = await fetch('/api/user/addresses')
        if (response.ok) {
          const data = await response.json()
          setAddresses(data.addresses || [])
        } else {
          toast.error('Error cargando direcciones')
        }
      } catch (error) {
        console.error('Error cargando direcciones:', error)
        toast.error('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchAddresses()
    }
  }, [session])

  // Abrir formulario para nueva dirección
  const openAddForm = () => {
    addressForm.reset({
      type: 'home',
      title: '',
      fullName: session?.user?.name || '',
      phone: '',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      instructions: '',
      isDefault: addresses.length === 0, // Primera dirección como predeterminada
    })
    setEditingAddress(null)
    setShowAddDialog(true)
  }

  // Abrir formulario para editar dirección
  const openEditForm = (address: Address) => {
    addressForm.reset({
      type: address.type,
      title: address.title,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode || '',
      instructions: address.instructions || '',
      isDefault: address.isDefault,
    })
    setEditingAddress(address)
    setShowAddDialog(true)
  }

  // Guardar dirección
  const onSubmitAddress = async (data: AddressFormData) => {
    setSaving(true)
    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses'
      
      const method = editingAddress ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (editingAddress) {
          // Actualizar dirección existente
          setAddresses(prev => prev.map(addr => 
            addr.id === editingAddress.id ? result.address : addr
          ))
          toast.success('¡Dirección actualizada correctamente!')
        } else {
          // Agregar nueva dirección
          setAddresses(prev => [...prev, result.address])
          toast.success('¡Dirección agregada correctamente!')
        }
        
        setShowAddDialog(false)
        setEditingAddress(null)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error guardando dirección')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Eliminar dirección
  const deleteAddress = async (address: Address) => {
    try {
      const response = await fetch(`/api/user/addresses/${address.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== address.id))
        toast.success('Dirección eliminada correctamente')
      } else {
        toast.error('Error eliminando dirección')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  // Establecer como predeterminada
  const setAsDefault = async (address: Address) => {
    try {
      const response = await fetch(`/api/user/addresses/${address.id}/default`, {
        method: 'PUT',
      })

      if (response.ok) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === address.id
        })))
        toast.success('Dirección predeterminada actualizada')
      } else {
        toast.error('Error actualizando dirección predeterminada')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  // Obtener icono del tipo de dirección
  const getAddressIcon = (type: string) => {
    const addressType = addressTypes.find(t => t.value === type)
    return addressType ? addressType.icon : MapPin
  }

  // Obtener label del tipo de dirección
  const getAddressLabel = (type: string) => {
    const addressType = addressTypes.find(t => t.value === type)
    return addressType ? addressType.label : 'Otro'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-dark"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-dark/5">
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b"
        {...fadeInLeft}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link 
              href="/perfil" 
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
            >
              <motion.div
                whileHover={{ x: -4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft className="w-5 h-5 text-brand-dark group-hover:text-brand-dark/80" />
              </motion.div>
              <Image
                src="/images/zulay c logo.png"
                alt="Zulay C"
                width={140}
                height={45}
                className="h-10 w-auto"
              />
            </Link>
            
            <div className="flex items-center gap-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-brand-dark transition-colors">
                Inicio
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/perfil" className="text-sm text-gray-500 hover:text-brand-dark transition-colors">
                Mi Perfil
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-brand-dark font-medium">Mis Direcciones</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-brand-dark" />
                  Mis Direcciones
                </h1>
                <p className="text-gray-600 mt-2">
                  Gestiona tus direcciones de entrega
                </p>
              </div>
              <Button
                onClick={openAddForm}
                className="bg-brand-dark hover:bg-brand-dark/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Dirección
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="space-y-6"
          {...staggerContainer}
        >
          {addresses.length === 0 ? (
            // Estado vacío
            <motion.div {...fadeInUp}>
              <Card className="text-center py-12">
                <CardContent>
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No tienes direcciones guardadas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Agrega tu primera dirección para facilitar tus compras
                  </p>
                  <Button
                    onClick={openAddForm}
                    className="bg-brand-dark hover:bg-brand-dark/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Dirección
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Lista de direcciones
            <div className="grid gap-6">
              <AnimatePresence>
                {addresses.map((address, index) => {
                  const Icon = getAddressIcon(address.type)
                  
                  return (
                    <motion.div
                      key={address.id}
                      {...fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      layout
                    >
                      <Card className={`relative ${address.isDefault ? 'ring-2 ring-brand-dark' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-brand-dark/10 rounded-lg">
                                <Icon className="w-5 h-5 text-brand-dark" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">{address.title}</h3>
                                  {address.isDefault && (
                                    <Badge className="bg-brand-dark text-white">
                                      <Star className="w-3 h-3 mr-1" />
                                      Predeterminada
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {getAddressLabel(address.type)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditForm(address)}
                                className="hover:bg-brand-dark/10"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-red-50 hover:text-red-600"
                                    disabled={address.isDefault}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. La dirección "{address.title}" será eliminada permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteAddress(address)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{address.fullName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{address.phone}</span>
                            </div>
                            
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p>{address.address}</p>
                                <p className="text-gray-600">
                                  {address.neighborhood}, {address.city}, {address.state}
                                  {address.postalCode && ` ${address.postalCode}`}
                                </p>
                                {address.instructions && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    <strong>Instrucciones:</strong> {address.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {!address.isDefault && (
                            <div className="mt-4 pt-4 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAsDefault(address)}
                                className="border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Establecer como predeterminada
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Dialog para agregar/editar dirección */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? 'Modifica los datos de tu dirección' 
                : 'Completa la información de tu nueva dirección'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={addressForm.handleSubmit(onSubmitAddress)} className="space-y-4">
            {/* Tipo y título */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Dirección *
                </label>
                <Select
                  value={addressForm.watch('type')}
                  onValueChange={(value) => addressForm.setValue('type', value as 'home' | 'work' | 'other')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {addressTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {addressForm.formState.errors.type && (
                  <p className="text-red-600 text-sm mt-1">{addressForm.formState.errors.type.message}</p>
                )}
              </div>
              
              <FormField
                label="Título de la Dirección"
                placeholder="ej: Casa Principal"
                error={addressForm.formState.errors.title?.message}
                {...addressForm.register('title')}
                required
              />
            </div>

            {/* Nombre y teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nombre Completo"
                placeholder="Quien recibe el pedido"
                error={addressForm.formState.errors.fullName?.message}
                {...addressForm.register('fullName')}
                required
              />
              
              <FormField
                label="Teléfono"
                placeholder="300 123 4567"
                error={addressForm.formState.errors.phone?.message}
                {...addressForm.register('phone')}
                required
              />
            </div>

            {/* Dirección */}
            <FormField
              label="Dirección Completa"
              placeholder="Carrera 10 # 25-30"
              error={addressForm.formState.errors.address?.message}
              {...addressForm.register('address')}
              required
            />

            {/* Barrio y ciudad */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Barrio"
                placeholder="ej: El Poblado"
                error={addressForm.formState.errors.neighborhood?.message}
                {...addressForm.register('neighborhood')}
                required
              />
              
              <FormField
                label="Ciudad"
                placeholder="ej: Medellín"
                error={addressForm.formState.errors.city?.message}
                {...addressForm.register('city')}
                required
              />
            </div>

            {/* Departamento y código postal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento *
                </label>
                <Select
                  value={addressForm.watch('state')}
                  onValueChange={(value) => addressForm.setValue('state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {colombianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addressForm.formState.errors.state && (
                  <p className="text-red-600 text-sm mt-1">{addressForm.formState.errors.state.message}</p>
                )}
              </div>
              
              <FormField
                label="Código Postal (Opcional)"
                placeholder="050001"
                error={addressForm.formState.errors.postalCode?.message}
                {...addressForm.register('postalCode')}
              />
            </div>

            {/* Instrucciones */}
            <FormField
              label="Instrucciones de Entrega (Opcional)"
              placeholder="ej: Apartamento 301, portero en recepción"
              error={addressForm.formState.errors.instructions?.message}
              {...addressForm.register('instructions')}
              multiline
            />

            {/* Dirección predeterminada */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                {...addressForm.register('isDefault')}
                className="rounded border-gray-300 text-brand-dark focus:ring-brand-dark"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Establecer como dirección predeterminada
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand-dark hover:bg-brand-dark/90 text-white"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingAddress ? 'Actualizar' : 'Guardar'} Dirección
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}