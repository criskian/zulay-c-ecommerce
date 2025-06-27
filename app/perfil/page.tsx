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
  User, Mail, Phone, MapPin, Edit3, Save, X, 
  Package, Heart, Settings, Shield, Camera,
  Truck, Clock, CheckCircle, Star, Home, ArrowLeft
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { PhoneInput } from '@/components/ui/phone-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

// Schemas de validación
const profileSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  email: z.string()
    .email('Formato de email inválido')
    .min(1, 'El email es requerido'),
  
  phone: z.string()
    .optional()
    .refine((val) => !val || val.length >= 10, 'El teléfono debe tener al menos 10 dígitos'),
})

const addressSchema = z.object({
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z.string().min(2, 'El departamento es requerido'),
  postalCode: z.string().optional(),
  neighborhood: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type AddressFormData = z.infer<typeof addressSchema>

interface UserData {
  id: string
  name: string | null
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  image: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  // Estados
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  // Forms
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    }
  })

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: '',
      city: '',
      state: '',
      postalCode: '',
      neighborhood: '',
    }
  })

  // Redirect si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return

      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
          
          // Actualizar forms con datos
          profileForm.reset({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
          })
          
          addressForm.reset({
            address: data.user.address || '',
            city: data.user.city || '',
            state: data.user.state || '',
            postalCode: data.user.postalCode || '',
            neighborhood: '', // Este campo no está en la BD aún
          })
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        toast.error('Error cargando tu perfil')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchUserData()
    }
  }, [session, profileForm, addressForm])

  // Guardar perfil
  const onSubmitProfile = async (data: ProfileFormData) => {
    setSavingProfile(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setUserData(result.user)
        setEditingProfile(false)
        toast.success('¡Perfil actualizado correctamente!')
        
        // Actualizar la sesión
        await update({
          name: result.user.name,
          email: result.user.email,
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error actualizando perfil')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSavingProfile(false)
    }
  }

  // Guardar dirección
  const onSubmitAddress = async (data: AddressFormData) => {
    setSavingAddress(true)
    try {
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setUserData(prev => prev ? { ...prev, ...result.user } : null)
        setEditingAddress(false)
        toast.success('¡Dirección actualizada correctamente!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error actualizando dirección')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSavingAddress(false)
    }
  }

  // Obtener iniciales para avatar
  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-dark/5">
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b"
        {...fadeInLeft}
      >
        {/* Navegación superior */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
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
              <span className="text-sm text-brand-dark font-medium">Mi Perfil</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={userData.image || ''} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-brand-dark to-brand-dark/90 text-white">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Info */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <h1 className="text-3xl font-bold text-gray-900">
                {userData.name || 'Usuario'}
              </h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {userData.email}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="bg-brand-dark/10 text-brand-dark border-brand-dark/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Cuenta verificada
                </Badge>
                <span className="text-sm text-gray-500">
                  Miembro desde {new Date(userData.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          {...staggerContainer}
        >
          {/* Columna izquierda - Navegación */}
          <motion.div className="lg:col-span-1" {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Mi Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start bg-brand-dark/5 text-brand-dark hover:bg-brand-dark/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  Información Personal
                </Button>
                <Link href="/pedidos">
                  <Button variant="ghost" className="w-full justify-start hover:bg-brand-dark/5 hover:text-brand-dark">
                    <Package className="w-4 h-4 mr-2" />
                    Mis Pedidos
                  </Button>
                </Link>
                <Link href="/favoritos">
                  <Button variant="ghost" className="w-full justify-start hover:bg-brand-dark/5 hover:text-brand-dark">
                    <Heart className="w-4 h-4 mr-2" />
                    Lista de Favoritos
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start hover:bg-brand-dark/5 hover:text-brand-dark" disabled>
                  <MapPin className="w-4 h-4 mr-2" />
                  Direcciones
                  <span className="ml-auto text-xs text-gray-400">Próximamente</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-brand-dark/5 hover:text-brand-dark" disabled>
                  <Shield className="w-4 h-4 mr-2" />
                  Privacidad y Seguridad
                  <span className="ml-auto text-xs text-gray-400">Próximamente</span>
                </Button>
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <motion.div 
              className="mt-6 grid grid-cols-2 gap-4"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="w-8 h-8 text-brand-dark mx-auto mb-2" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Pedidos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-brand-dark mx-auto mb-2" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Favoritos</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Columna derecha - Contenido */}
          <motion.div className="lg:col-span-2 space-y-6" {...fadeInUp}>
            {/* Información Personal */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Mantén tu información actualizada para una mejor experiencia
                  </CardDescription>
                </div>
                <Button
                  variant={editingProfile ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (editingProfile) {
                      profileForm.reset()
                    }
                    setEditingProfile(!editingProfile)
                  }}
                >
                  {editingProfile ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {editingProfile ? (
                    <motion.form
                      key="editing"
                      onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <FormField
                        label="Nombre completo"
                        placeholder="Tu nombre completo"
                        error={profileForm.formState.errors.name?.message}
                        {...profileForm.register('name')}
                        required
                      />
                      
                      <FormField
                        label="Correo electrónico"
                        type="email"
                        placeholder="tu@email.com"
                        error={profileForm.formState.errors.email?.message}
                        {...profileForm.register('email')}
                        required
                      />
                      
                      <PhoneInput
                        label="Teléfono"
                        placeholder="300 123 4567"
                        error={profileForm.formState.errors.phone?.message}
                        value={profileForm.watch('phone') || ''}
                        onChange={(value) => profileForm.setValue('phone', value)}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="submit" 
                          disabled={savingProfile}
                          className="flex-1 bg-brand-dark hover:bg-brand-dark/90 text-white border-brand-dark hover:border-brand-dark/90"
                        >
                          {savingProfile ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar Cambios
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="viewing"
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Nombre</label>
                          <p className="text-lg font-medium">{userData.name || 'No especificado'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-lg font-medium">{userData.email}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Teléfono</label>
                          <p className="text-lg font-medium">{userData.phone || 'No especificado'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Dirección de Envío */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Dirección de Envío
                  </CardTitle>
                  <CardDescription>
                    Dirección principal para tus pedidos
                  </CardDescription>
                </div>
                <Button
                  variant={editingAddress ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (editingAddress) {
                      addressForm.reset()
                    }
                    setEditingAddress(!editingAddress)
                  }}
                >
                  {editingAddress ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {editingAddress ? (
                    <motion.form
                      key="editing-address"
                      onSubmit={addressForm.handleSubmit(onSubmitAddress)}
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <FormField
                        label="Dirección"
                        placeholder="Calle 123 #45-67"
                        error={addressForm.formState.errors.address?.message}
                        {...addressForm.register('address')}
                        required
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Ciudad"
                          placeholder="Bogotá"
                          error={addressForm.formState.errors.city?.message}
                          {...addressForm.register('city')}
                          required
                        />
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Departamento <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...addressForm.register('state')}
                            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark ${
                              addressForm.formState.errors.state 
                                ? 'border-red-300 bg-red-50' 
                                : !addressForm.formState.errors.state && addressForm.watch('state') 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            <option value="">Selecciona un departamento</option>
                            {colombianStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                          {addressForm.formState.errors.state && (
                            <p className="text-sm text-red-600 flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full" />
                              {addressForm.formState.errors.state.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Código Postal (opcional)"
                          placeholder="110111"
                          error={addressForm.formState.errors.postalCode?.message}
                          {...addressForm.register('postalCode')}
                        />
                        
                        <FormField
                          label="Barrio (opcional)"
                          placeholder="Chapinero"
                          error={addressForm.formState.errors.neighborhood?.message}
                          {...addressForm.register('neighborhood')}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="submit" 
                          disabled={savingAddress}
                          className="flex-1 bg-brand-dark hover:bg-brand-dark/90 text-white border-brand-dark hover:border-brand-dark/90"
                        >
                          {savingAddress ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar Dirección
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="viewing-address"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {userData.address ? (
                        <div className="space-y-3">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Home className="w-5 h-5 text-gray-600 mt-1" />
                              <div>
                                <p className="font-medium">{userData.address}</p>
                                <p className="text-gray-600">
                                  {userData.city}, {userData.state}
                                  {userData.postalCode && ` ${userData.postalCode}`}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-brand-dark">
                            <CheckCircle className="w-4 h-4" />
                            Dirección verificada para envíos
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">No tienes una dirección configurada</p>
                          <Button 
                            onClick={() => setEditingAddress(true)}
                            variant="outline"
                            className="border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Agregar Dirección
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No hay actividad reciente</p>
                  <p className="text-sm text-gray-500">
                    Tus pedidos y actividades aparecerán aquí
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 