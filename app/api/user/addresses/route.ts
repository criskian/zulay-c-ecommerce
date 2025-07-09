import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema de validación para direcciones
const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  title: z.string().min(2).max(50),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  address: z.string().min(10).max(200),
  neighborhood: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().min(1),
  postalCode: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
})

// GET - Obtener todas las direcciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener todas las direcciones del usuario
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      message: 'Direcciones obtenidas correctamente',
      addresses,
    })

  } catch (error) {
    console.error('Error obteniendo direcciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva dirección
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = addressSchema.parse(body)

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si es la primera dirección o se marca como predeterminada, actualizar otras
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: user.id,
          isDefault: true 
        },
        data: { isDefault: false }
      })
    }

    // Verificar si es la primera dirección del usuario
    const existingAddresses = await prisma.address.count({
      where: { userId: user.id }
    })

    // Si es la primera dirección, marcarla como predeterminada
    const shouldBeDefault = existingAddresses === 0 || validatedData.isDefault

    // Crear la nueva dirección
    const newAddress = await prisma.address.create({
      data: {
        ...validatedData,
        isDefault: shouldBeDefault,
        userId: user.id,
      }
    })

    console.log(`✅ Nueva dirección creada para usuario: ${user.email}`)
    
    return NextResponse.json({
      message: 'Dirección creada correctamente',
      address: newAddress,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('Error creando dirección:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 