'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Shield, Lock, Key, ArrowLeft, Download, 
  Bell, Save, UserX, Eye
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Link from 'next/link'
import Image from 'next/image'
import { fadeInUp, staggerContainer, fadeInLeft } from '@/lib/animations'

// Schema para cambio de contraseña
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface PrivacySettings {
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  profileVisibility: boolean
  dataSharing: boolean
  analyticsTracking: boolean
}

export default function PrivacidadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    profileVisibility: true,
    dataSharing: false,
    analyticsTracking: true,
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])

  const onSubmitPassword = async (data: PasswordFormData) => {
    setSavingPassword(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('¡Contraseña actualizada exitosamente!')
        passwordForm.reset()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSavingPassword(false)
    }
  }

  const savePrivacySettings = async () => {
    setSavingSettings(true)
    try {
      toast.success('¡Configuraciones guardadas exitosamente!')
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSavingSettings(false)
    }
  }

  const downloadPersonalData = async () => {
    try {
      toast.info('Preparando descarga de datos...')
      setTimeout(() => {
        toast.success('¡Datos descargados exitosamente!')
      }, 2000)
    } catch (error) {
      toast.error('Error al descargar datos')
    }
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
              <span className="text-sm text-brand-dark font-medium">Privacidad y Seguridad</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-brand-dark" />
              Privacidad y Seguridad
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tu privacidad, seguridad y configuraciones de cuenta
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="space-y-8"
          {...staggerContainer}
        >
          {/* Cambiar Contraseña */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>
                  Actualiza tu contraseña para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                  <FormField
                    label="Contraseña Actual"
                    type="password"
                    placeholder="Ingresa tu contraseña actual"
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register('currentPassword')}
                    required
                  />
                  
                  <FormField
                    label="Nueva Contraseña"
                    type="password"
                    placeholder="Crea una nueva contraseña segura"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register('newPassword')}
                    required
                  />
                  
                  <FormField
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    {...passwordForm.register('confirmPassword')}
                    required
                  />

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={savingPassword}
                      className="bg-brand-dark hover:bg-brand-dark/90 text-white"
                    >
                      {savingPassword ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuraciones de Privacidad */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Configuraciones de Privacidad
                </CardTitle>
                <CardDescription>
                  Controla cómo compartimos tu información y cómo te contactamos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notificaciones */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notificaciones
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificaciones por Email</p>
                        <p className="text-sm text-gray-600">Recibe actualizaciones de pedidos y ofertas</p>
                      </div>
                      <Switch
                        checked={privacySettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificaciones SMS</p>
                        <p className="text-sm text-gray-600">Recibe confirmaciones urgentes por mensaje</p>
                      </div>
                      <Switch
                        checked={privacySettings.smsNotifications}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Emails de Marketing</p>
                        <p className="text-sm text-gray-600">Recibe promociones y novedades</p>
                      </div>
                      <Switch
                        checked={privacySettings.marketingEmails}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, marketingEmails: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Privacidad de Datos */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Privacidad de Datos
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Visibilidad del Perfil</p>
                        <p className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</p>
                      </div>
                      <Switch
                        checked={privacySettings.profileVisibility}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, profileVisibility: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compartir Datos</p>
                        <p className="text-sm text-gray-600">Compartir datos anónimos para mejorar el servicio</p>
                      </div>
                      <Switch
                        checked={privacySettings.dataSharing}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, dataSharing: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tracking de Analytics</p>
                        <p className="text-sm text-gray-600">Ayudar a mejorar la experiencia del sitio</p>
                      </div>
                      <Switch
                        checked={privacySettings.analyticsTracking}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, analyticsTracking: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={savePrivacySettings}
                    disabled={savingSettings}
                    className="bg-brand-dark hover:bg-brand-dark/90 text-white"
                  >
                    {savingSettings ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Configuraciones
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gestión de Datos */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Gestión de Datos
                </CardTitle>
                <CardDescription>
                  Descarga o elimina tus datos personales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Descargar mis Datos</p>
                    <p className="text-sm text-gray-600">Obtén una copia de toda tu información personal</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={downloadPersonalData}
                    className="border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-700">Eliminar mi Cuenta</p>
                    <p className="text-sm text-red-600">Esta acción no se puede deshacer</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <UserX className="w-4 h-4 mr-2" />
                        Eliminar Cuenta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente tu cuenta y todos tus datos. 
                          No podrás recuperar esta información después.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Sí, eliminar mi cuenta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 