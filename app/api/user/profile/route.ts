import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para actualizar perfil
const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  email: z.string()
    .email('Formato de email inválido')
    .min(1, 'El email es requerido'),
  
  phone: z.string()
    .optional()
    .refine((val) => !val || val.trim() === '' || val.length >= 10, 'El teléfono debe tener al menos 10 dígitos'),
})

// GET - Obtener datos del perfil
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'No autorizado'
      }, { status: 401 })
    }

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: user
    })

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error)
    
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PUT - Actualizar datos del perfil
export async function PUT(request: NextRequest) {
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
    const validatedData = updateProfileSchema.parse(body)

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!existingUser) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Verificar si el nuevo email ya está en uso (si cambió)
    if (validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json({
          error: 'El email ya está registrado por otro usuario'
        }, { status: 409 })
      }
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
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
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Log de auditoría
    console.log(`✅ Perfil actualizado para usuario: ${validatedData.email} - ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: '¡Perfil actualizado correctamente!',
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
    
    console.error('❌ Error al actualizar perfil:', error)
    
    return NextResponse.json({
      error: 'Error interno del servidor. Por favor intenta nuevamente.'
    }, { status: 500 })
  }
} 