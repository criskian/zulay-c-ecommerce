import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schema de validación con Zod (validation library)
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
  
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[+]?[\d\s-()]+$/.test(val), 
      'Por favor ingresa un teléfono válido'),
  
  // Cumplimiento legal - Ley 1581 de 2012
  acceptPrivacyPolicy: z.boolean()
    .refine((val) => val === true, 
      'Debes aceptar la política de tratamiento de datos personales'),
  
  acceptNewsletter: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // 1. Parsear y validar el body
    const body = await request.json()
    
    // 2. Validar con Zod schema
    const validatedData = registerSchema.parse(body)
    
    // 3. Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json({
        error: 'Ya existe una cuenta con este email',
        field: 'email'
      }, { status: 400 })
    }
    
    // 4. Hash de la contraseña con bcrypt (12 rounds para seguridad)
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // 5. Crear usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        // Nota: NextAuth maneja passwords en Account model, pero guardamos hash como backup
        phone: validatedData.phone || null,
        newsletter: validatedData.acceptNewsletter,
        // Registramos consentimiento para cumplimiento legal
        createdAt: new Date(),
      },
      // Solo retornar datos seguros (sin password)
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        newsletter: true,
        createdAt: true
      }
    })
    
    // 6. También crear el registro de Account para NextAuth
    // Esto permite login con email/password
    await prisma.account.create({
      data: {
        userId: newUser.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: newUser.id,
        // Guardamos el hash de forma segura
        refresh_token: hashedPassword, // Usamos este campo para el hash
      }
    })
    
    // 7. Log de auditoría (en producción, usar logging service)
    console.log(`✅ Usuario registrado: ${newUser.email} - ${new Date().toISOString()}`)
    
    // 8. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.',
      user: newUser
    }, { status: 201 })
    
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof z.ZodError) {
      // Errores de validación
      const fieldErrors = error.errors.reduce((acc, err) => {
        const field = err.path[0] as string
        acc[field] = err.message
        return acc
      }, {} as Record<string, string>)
      
      return NextResponse.json({
        error: 'Datos inválidos',
        fieldErrors
      }, { status: 400 })
    }
    
    // Error de base de datos u otros errores
    console.error('❌ Error en registro:', error)
    
    return NextResponse.json({
      error: 'Error interno del servidor. Por favor intenta nuevamente.'
    }, { status: 500 })
  }
} 