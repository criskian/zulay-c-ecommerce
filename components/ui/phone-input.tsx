'use client'

import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Lista de países con prefijos (enfoque en LATAM y principales países)
const countries = [
  { code: 'CO', name: 'Colombia', prefix: '+57', flag: '🇨🇴' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1', flag: '🇺🇸' },
  { code: 'AR', name: 'Argentina', prefix: '+54', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', prefix: '+55', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', prefix: '+56', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', prefix: '+51', flag: '🇵🇪' },
  { code: 'EC', name: 'Ecuador', prefix: '+593', flag: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', prefix: '+58', flag: '🇻🇪' },
  { code: 'MX', name: 'México', prefix: '+52', flag: '🇲🇽' },
  { code: 'PA', name: 'Panamá', prefix: '+507', flag: '🇵🇦' },
  { code: 'CR', name: 'Costa Rica', prefix: '+506', flag: '🇨🇷' },
  { code: 'GT', name: 'Guatemala', prefix: '+502', flag: '🇬🇹' },
  { code: 'ES', name: 'España', prefix: '+34', flag: '🇪🇸' },
  { code: 'CA', name: 'Canadá', prefix: '+1', flag: '🇨🇦' },
]

interface PhoneInputProps {
  label: string
  placeholder?: string
  error?: string
  isValid?: boolean
  isLoading?: boolean
  description?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  required?: boolean
  className?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ 
    label, 
    placeholder = "300 123 4567",
    error, 
    isValid, 
    isLoading, 
    description, 
    value = '',
    onChange,
    onBlur,
    required,
    className
  }, ref) => {
    // Colombia por defecto
    const [selectedCountry, setSelectedCountry] = useState(countries[0])
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    // Extraer el número sin prefijo para mostrar en el input
    const getDisplayNumber = () => {
      if (!value) return ''
      
      // Si el valor ya tiene el prefijo, lo removemos para display
      if (value.startsWith(selectedCountry.prefix)) {
        return value.slice(selectedCountry.prefix.length).trim()
      }
      
      return value
    }

    // Manejar cambio en el número
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawNumber = e.target.value.replace(/[^\d\s-()]/g, '') // Solo números, espacios, guiones y paréntesis
      const fullNumber = selectedCountry.prefix + ' ' + rawNumber
      onChange?.(fullNumber)
    }

    // Manejar selección de país
    const handleCountrySelect = (country: typeof countries[0]) => {
      setSelectedCountry(country)
      setIsOpen(false)
      
      // Actualizar el número con el nuevo prefijo
      const currentNumber = getDisplayNumber()
      if (currentNumber) {
        const fullNumber = country.prefix + ' ' + currentNumber
        onChange?.(fullNumber)
      }
    }

    const hasError = !!error
    const showSuccess = isValid && !hasError && !isFocused

    return (
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Label */}
        <motion.label 
          className={cn(
            "block text-sm font-medium transition-colors duration-200",
            hasError ? "text-red-600" : "text-gray-700",
            isFocused && !hasError && "text-blue-600"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {/* Input container */}
        <div className="relative">
          <div className={cn(
            "flex border rounded-lg transition-all duration-200",
            "focus-within:outline-none",
            
            // Estados de validación
            hasError && [
              "border-red-300 bg-red-50",
              "focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200"
            ],
            
            showSuccess && [
              "border-green-300 bg-green-50",
              "focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200"
            ],
            
            !hasError && !showSuccess && [
              "border-gray-300 bg-white",
              "focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200",
              "hover:border-gray-400"
            ]
          )}>
            {/* Selector de país */}
            <div className="relative">
              <motion.button
                type="button"
                className={cn(
                  "flex items-center gap-2 px-3 py-3 border-r border-gray-300",
                  "hover:bg-gray-50 transition-colors rounded-l-lg",
                  "focus:outline-none focus:bg-gray-50",
                  hasError && "border-red-300",
                  showSuccess && "border-green-300"
                )}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm font-medium text-gray-700">
                  {selectedCountry.prefix}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-400 transition-transform duration-200",
                  isOpen && "rotate-180"
                )} />
              </motion.button>

              {/* Dropdown de países */}
              <AnimatePresence>
                {isOpen && (
                  <>
                    {/* Overlay para cerrar */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsOpen(false)} 
                    />
                    
                    {/* Lista de países */}
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
                    >
                      {countries.map((country) => (
                        <motion.button
                          key={country.code}
                          type="button"
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-left",
                            "hover:bg-gray-50 transition-colors",
                            "focus:outline-none focus:bg-gray-50",
                            selectedCountry.code === country.code && "bg-blue-50 text-blue-700"
                          )}
                          onClick={() => handleCountrySelect(country)}
                          whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                        >
                          <span className="text-lg">{country.flag}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{country.name}</span>
                              <span className="text-sm text-gray-500">{country.prefix}</span>
                            </div>
                          </div>
                          {selectedCountry.code === country.code && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Input del número */}
            <input
              ref={ref}
              type="tel"
              placeholder={placeholder}
              value={getDisplayNumber()}
              onChange={handleNumberChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false)
                onBlur?.()
              }}
              className={cn(
                "flex-1 px-4 py-3 bg-transparent focus:outline-none",
                "placeholder:text-gray-400",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                hasError && "text-red-900",
                className
              )}
            />

            {/* Iconos de estado */}
            <div className="flex items-center pr-3">
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                )}
                
                {!isLoading && hasError && (
                  <motion.div
                    key="error"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </motion.div>
                )}
                
                {!isLoading && showSuccess && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {description && !error && (
          <motion.p 
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}

        {/* Mensaje de error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-sm text-red-600"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview del número completo */}
        {value && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 flex items-center gap-1"
          >
            <span>Número completo:</span>
            <span className="font-medium text-gray-700">{value}</span>
          </motion.div>
        )}
      </motion.div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput' 