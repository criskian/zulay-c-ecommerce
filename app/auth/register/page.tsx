'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FormField } from '@/components/ui/form-field'
import { PhoneInput } from '@/components/ui/phone-input'
import { AddressForm } from '@/components/forms/address-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ArrowLeft, Shield, Lock, UserCheck } from 'lucide-react'

// Schema de validación (mismo que el backend)
const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  
  email: z.string()
    .email('Por favor ingresa un email válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número'),
  
  confirmPassword: z.string(),
  
  phone: z.string()
    .optional()
    .refine((val) => !val || val.length === 0 || /^[+]?[\d\s-()]+$/.test(val), 
      'Por favor ingresa un teléfono válido')
    .transform((val) => val || undefined),
  
  acceptPrivacyPolicy: z.boolean()
    .refine((val) => val === true, 
      'Debes aceptar la política de tratamiento de datos personales'),
  
  acceptNewsletter: z.boolean().optional().default(false)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

// Componente de indicador de fuerza de contraseña
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[a-z]/.test(pass)) score++
    if (/[A-Z]/.test(pass)) score++
    if (/\d/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = getStrength(password)
  const getColor = () => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-yellow-500'
    if (strength <= 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getLabel = () => {
    if (strength <= 1) return 'Muy débil'
    if (strength <= 2) return 'Débil'
    if (strength <= 3) return 'Buena'
    return 'Muy fuerte'
  }

  return (
    <motion.div 
      className="mt-2 space-y-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              level <= strength ? getColor() : 'bg-gray-200'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: level <= strength ? 1 : 0 }}
            transition={{ delay: level * 0.1 }}
          />
        ))}
      </div>
      <p className={`text-xs ${
        strength <= 1 ? 'text-red-600' :
        strength <= 2 ? 'text-yellow-600' :
        strength <= 3 ? 'text-blue-600' : 'text-green-600'
      }`}>
        Seguridad: {getLabel()}
      </p>
    </motion.div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newUserData, setNewUserData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
    setError,
    clearErrors
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      acceptPrivacyPolicy: false,
      acceptNewsletter: false
    }
  })

  // Observar campos para validaciones en tiempo real
  const watchedPassword = watch('password', '')
  const watchedName = watch('name', '')
  const watchedEmail = watch('email', '')
  const watchedPhone = watch('phone', '')

  // Función para enviar el formulario
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    clearErrors()

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.fieldErrors) {
          // Mostrar errores específicos de cada campo
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof RegisterFormData, {
              type: 'server',
              message: message as string
            })
          })
        } else {
          toast.error(result.error || 'Error al crear la cuenta')
        }
        return
      }

      // Registro exitoso
      setNewUserData(result.user)
      setShowSuccess(true)
      toast.success('¡Cuenta creada exitosamente!')
      
      // Mostrar opción de dirección después de 2 segundos
      setTimeout(() => {
        setShowSuccess(false)
        setShowAddressForm(true)
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar éxito en el formulario de dirección
  const handleAddressSuccess = () => {
    toast.success('¡Perfil completado!')
    router.push('/auth/login?message=account-created&address=added')
  }

  // Manejar saltar dirección
  const handleSkipAddress = () => {
    router.push('/auth/login?message=account-created&address=skipped')
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserCheck className="w-8 h-8 text-green-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Cuenta Creada!
          </h1>
          
          <p className="text-gray-600 mb-4">
            Tu cuenta ha sido creada exitosamente. Serás redirigido al login...
          </p>
          
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    )
  }

  if (showAddressForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <motion.header 
          className="bg-white shadow-sm border-b"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/zulay c logo.png"
                  alt="Zulay C"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                ¡Hola {newUserData?.name}! 👋
              </div>
            </div>
          </div>
        </motion.header>

        {/* Contenido principal */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <AddressForm
              onSuccess={handleAddressSuccess}
              onSkip={handleSkipAddress}
              showSkipOption={true}
              title="¿Agregar tu dirección?"
              description="Esto te ayudará a completar tus compras más rápido"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header con navegación */}
      <motion.header 
        className="bg-white shadow-sm border-b"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <Image
                src="/images/zulay c logo.png"
                alt="Zulay C"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            
            <Link 
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ¿Ya tienes cuenta? <span className="font-medium text-blue-600">Inicia sesión</span>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="max-w-md w-full space-y-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Encabezado */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">
                Crear cuenta
              </h1>
              <p className="mt-2 text-gray-600">
                Únete a Zulay C y descubre el mejor calzado colombiano
              </p>
            </motion.div>

            {/* Indicadores de seguridad */}
            <motion.div 
              className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Datos seguros</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Privacidad protegida</span>
              </div>
            </motion.div>
          </div>

          {/* Formulario */}
          <motion.div
            className="bg-white py-8 px-6 shadow-lg rounded-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre completo */}
              <FormField
                label="Nombre completo"
                placeholder="Ej: María García"
                error={errors.name?.message}
                isValid={!errors.name && watchedName.length > 0}
                {...register('name')}
                required
              />

              {/* Email */}
              <FormField
                label="Correo electrónico"
                type="email"
                placeholder="tu@email.com"
                error={errors.email?.message}
                isValid={!errors.email && watchedEmail.length > 0}
                description="Usaremos este email para enviarte confirmaciones de pedidos"
                {...register('email')}
                required
              />

              {/* Teléfono (opcional) */}
              <PhoneInput
                label="Teléfono (opcional)"
                placeholder="300 123 4567"
                error={errors.phone?.message}
                isValid={!errors.phone && (watchedPhone?.length ?? 0) > 0}
                description="Para contactarte sobre tu pedido si es necesario"
                value={watchedPhone || ''}
                onChange={(value) => {
                  setValue('phone', value, { shouldValidate: true })
                }}
                onBlur={() => trigger('phone')}
              />

              {/* Contraseña */}
              <div>
                <FormField
                  label="Contraseña"
                  type="password"
                  placeholder="Crea una contraseña segura"
                  error={errors.password?.message}
                  showPasswordToggle
                  {...register('password')}
                  required
                />
                
                {/* Indicador de fuerza de contraseña */}
                <AnimatePresence>
                  {watchedPassword && (
                    <PasswordStrengthIndicator password={watchedPassword} />
                  )}
                </AnimatePresence>
              </div>

              {/* Confirmar contraseña */}
              <FormField
                label="Confirmar contraseña"
                type="password"
                placeholder="Repite tu contraseña"
                error={errors.confirmPassword?.message}
                showPasswordToggle
                {...register('confirmPassword')}
                required
              />

              {/* Checkboxes de consentimiento */}
              <div className="space-y-4">
                {/* Política de privacidad (obligatorio) */}
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Checkbox
                    id="privacy"
                    checked={watch('acceptPrivacyPolicy')}
                    onCheckedChange={(checked) => {
                      setValue('acceptPrivacyPolicy', !!checked, { shouldValidate: true })
                    }}
                    className="mt-1"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700 leading-relaxed">
                    Acepto la{' '}
                    <Link 
                      href="/privacidad" 
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Política de Tratamiento de Datos Personales
                    </Link>
                    {' '}y autorizo el tratamiento de mis datos conforme a la Ley 1581 de 2012. <span className="text-red-500">*</span>
                  </label>
                </motion.div>

                {errors.acceptPrivacyPolicy && (
                  <motion.p 
                    className="text-sm text-red-600 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    {errors.acceptPrivacyPolicy.message}
                  </motion.p>
                )}

                {/* Newsletter (opcional) */}
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Checkbox
                    id="newsletter"
                    checked={watch('acceptNewsletter')}
                    onCheckedChange={(checked) => {
                      setValue('acceptNewsletter', !!checked, { shouldValidate: true })
                    }}
                    className="mt-1"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-700 leading-relaxed">
                    Quiero recibir noticias, ofertas especiales y novedades de Zulay C (opcional)
                  </label>
                </motion.div>
              </div>

              {/* Botón de registro */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear mi cuenta'
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* Footer del formulario */}
          <motion.div 
            className="text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Al crear una cuenta, aceptas nuestros términos de servicio y confirmas que has leído nuestra política de privacidad.
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 