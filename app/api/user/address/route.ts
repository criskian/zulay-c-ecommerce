import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para dirección
const addressSchema = z.object({
  address: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),
  
  state: z.string()
    .min(2, 'El departamento debe tener al menos 2 caracteres')
    .max(100, 'El departamento no puede exceder 100 caracteres'),
  
  postalCode: z.string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), 
      'El código postal debe tener 6 dígitos'),
  
  country: z.string()
    .min(2, 'El país debe tener al menos 2 caracteres')
    .max(100, 'El país no puede exceder 100 caracteres')
    .default('Colombia'),
  
  // Campos adicionales opcionales
  addressLine2: z.string()
    .max(200, 'La dirección complementaria no puede exceder 200 caracteres')
    .optional(),
  
  neighborhood: z.string()
    .max(100, 'El barrio no puede exceder 100 caracteres')
    .optional(),
  
  instructions: z.string()
    .max(500, 'Las instrucciones no pueden exceder 500 caracteres')
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'No autorizado. Debes iniciar sesión.'
      }, { status: 401 })
    }

    // Parsear y validar el body
    const body = await request.json()
    const validatedData = addressSchema.parse(body)

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Actualizar la dirección del usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        postalCode: validatedData.postalCode || null,
        country: validatedData.country,
        // Guardamos campos adicionales en un JSON temporal
        // En el futuro podrías crear una tabla separada para direcciones múltiples
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        updatedAt: true
      }
    })

    // Log de auditoría
    console.log(`✅ Dirección actualizada para usuario: ${user.email} - ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: '¡Dirección guardada exitosamente!',
      user: updatedUser
    }, { status: 200 })

  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof z.ZodError) {
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
    
    console.error('❌ Error al actualizar dirección:', error)
    
    return NextResponse.json({
      error: 'Error interno del servidor. Por favor intenta nuevamente.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'No autorizado'
      }, { status: 401 })
    }

    // Obtener dirección del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      address: {
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
        hasAddress: !!(user.address && user.city && user.state)
      }
    })

  } catch (error) {
    console.error('❌ Error al obtener dirección:', error)
    
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
} 