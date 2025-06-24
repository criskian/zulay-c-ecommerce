'use client'

import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  isValid?: boolean
  isLoading?: boolean
  description?: string
  showPasswordToggle?: boolean
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    error, 
    isValid, 
    isLoading, 
    description, 
    showPasswordToggle, 
    type = 'text',
    className,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type

    const hasError = !!error
    const showSuccess = isValid && !hasError && !isFocused

    return (
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Label con animación */}
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
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {/* Container del input con estado visual */}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base styles
              "w-full px-4 py-3 border rounded-lg transition-all duration-200",
              "placeholder:text-gray-400 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              
              // Estados de validación
              hasError && [
                "border-red-300 bg-red-50 text-red-900",
                "focus:border-red-500 focus:ring-2 focus:ring-red-200"
              ],
              
              showSuccess && [
                "border-green-300 bg-green-50",
                "focus:border-green-500 focus:ring-2 focus:ring-green-200"
              ],
              
              !hasError && !showSuccess && [
                "border-gray-300 bg-white",
                "focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                "hover:border-gray-400"
              ],
              
              // Padding para iconos
              showPasswordToggle && "pr-12",
              (showSuccess || hasError) && !showPasswordToggle && "pr-10",
              
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Iconos de estado y toggle de password */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            {/* Toggle de password */}
            {showPasswordToggle && (
              <motion.button
                type="button"
                className={cn(
                  "px-3 text-gray-400 hover:text-gray-600 transition-colors",
                  "focus:outline-none focus:text-gray-600"
                )}
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </motion.button>
            )}

            {/* Icono de estado (sin toggle de password) */}
            {!showPasswordToggle && (
              <div className="px-3">
                <AnimatePresence mode="wait">
                  {hasError && (
                    <motion.div
                      key="error"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </motion.div>
                  )}
                  
                  {showSuccess && (
                    <motion.div
                      key="success"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Loading spinner */}
          {isLoading && (
            <motion.div 
              className="absolute inset-y-0 right-3 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </div>

        {/* Descripción del campo */}
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

        {/* Mensaje de error con animación */}
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
      </motion.div>
    )
  }
)

FormField.displayName = 'FormField' 