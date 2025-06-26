'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, Home, Building } from 'lucide-react'

// Lista de departamentos de Colombia
const colombianStates = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 
  'Vaupés', 'Vichada'
]

// Schema de validación
const addressSchema = z.object({
  address: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),
  
  state: z.string()
    .min(2, 'Selecciona un departamento'),
  
  postalCode: z.string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), 
      'El código postal debe tener 6 dígitos'),
  
  country: z.string().default('Colombia'),
  
  neighborhood: z.string()
    .max(100, 'El barrio no puede exceder 100 caracteres')
    .optional(),
  
  instructions: z.string()
    .max(500, 'Las instrucciones no pueden exceder 500 caracteres')
    .optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddressFormProps {
  onSuccess?: (data: AddressFormData) => void
  onSkip?: () => void
  isLoading?: boolean
  initialData?: Partial<AddressFormData>
  showSkipOption?: boolean
  title?: string
  description?: string
}

export function AddressForm({ 
  onSuccess, 
  onSkip, 
  isLoading = false,
  initialData,
  showSkipOption = true,
  title = "Agregar dirección de envío",
  description = "Completa tu información de envío para recibir tus pedidos"
}: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
    clearErrors
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'onChange',
    defaultValues: {
      country: 'Colombia',
      ...initialData
    }
  })

  // Observar campos para validaciones
  const watchedAddress = watch('address', '')
  const watchedCity = watch('city', '')
  const watchedState = watch('state', '')

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true)
    clearErrors()

    try {
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof AddressFormData, {
              type: 'server',
              message: message as string
            })
          })
        } else {
          toast.error(result.error || 'Error al guardar la dirección')
        }
        return
      }

      toast.success('¡Dirección guardada exitosamente!')
      onSuccess?.(data)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <MapPin className="w-8 h-8 text-blue-600" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Dirección principal */}
        <FormField
          label="Dirección principal"
          placeholder="Ej: Calle 123 #45-67"
          error={errors.address?.message}
          isValid={!errors.address && watchedAddress.length > 0}
          description="Incluye calle, número, apartamento si aplica"
          {...register('address')}
          required
        />

        {/* Ciudad y Departamento en fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Ciudad"
            placeholder="Ej: Bogotá"
            error={errors.city?.message}
            isValid={!errors.city && watchedCity.length > 0}
            {...register('city')}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Departamento <span className="text-red-500">*</span>
            </label>
            <select
              {...register('state')}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${
                errors.state 
                  ? 'border-red-300 bg-red-50' 
                  : !errors.state && watchedState 
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
            {errors.state && (
              <p className="text-sm text-red-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                {errors.state.message}
              </p>
            )}
          </div>
        </div>

        {/* Código postal y Barrio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Código postal (opcional)"
            placeholder="123456"
            error={errors.postalCode?.message}
            description="6 dígitos"
            {...register('postalCode')}
          />

          <FormField
            label="Barrio (opcional)"
            placeholder="Ej: Chapinero"
            error={errors.neighborhood?.message}
            {...register('neighborhood')}
          />
        </div>

        {/* Instrucciones especiales */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Instrucciones especiales (opcional)
          </label>
          <textarea
            {...register('instructions')}
            placeholder="Ej: Portería en el segundo piso, timbre azul..."
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none ${
              errors.instructions 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          />
          {errors.instructions && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              {errors.instructions.message}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 h-12 text-base font-medium"
            disabled={isSubmitting || isLoading || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Home className="w-5 h-5 mr-2" />
                Guardar dirección
              </>
            )}
          </Button>

          {showSkipOption && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 text-base font-medium"
              onClick={onSkip}
              disabled={isSubmitting || isLoading}
            >
              <Building className="w-5 h-5 mr-2" />
              Agregar más tarde
            </Button>
          )}
        </div>
      </form>

      {/* Footer informativo */}
      <motion.div 
        className="text-center text-sm text-gray-500 border-t pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p>
          🚚 <strong>Envío gratis</strong> en compras superiores a $100.000 COP
        </p>
        <p className="mt-1">
          📍 Puedes agregar múltiples direcciones desde tu perfil
        </p>
      </motion.div>
    </motion.div>
  )
} 