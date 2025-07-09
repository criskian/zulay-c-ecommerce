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

// PUT - Actualizar dirección específica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar que la dirección pertenece al usuario
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // Si se marca como predeterminada, quitar el flag de otras direcciones
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: user.id,
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    // Actualizar la dirección
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: validatedData
    })

    console.log(`✅ Dirección actualizada: ${params.id} para usuario: ${user.email}`)
    
    return NextResponse.json({
      message: 'Dirección actualizada correctamente',
      address: updatedAddress,
    })

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

    console.error('Error actualizando dirección:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar dirección específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar que la dirección pertenece al usuario
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // No permitir eliminar la dirección predeterminada si es la única
    if (existingAddress.isDefault) {
      const addressCount = await prisma.address.count({
        where: { userId: user.id }
      })

      if (addressCount === 1) {
        return NextResponse.json(
          { error: 'No puedes eliminar tu única dirección predeterminada' },
          { status: 400 }
        )
      }

      // Si hay más direcciones, establecer otra como predeterminada
      const otherAddress = await prisma.address.findFirst({
        where: { 
          userId: user.id,
          id: { not: params.id }
        },
        orderBy: { createdAt: 'asc' }
      })

      if (otherAddress) {
        await prisma.address.update({
          where: { id: otherAddress.id },
          data: { isDefault: true }
        })
      }
    }

    // Eliminar la dirección
    await prisma.address.delete({
      where: { id: params.id }
    })

    console.log(`✅ Dirección eliminada: ${params.id} para usuario: ${user.email}`)
    
    return NextResponse.json({
      message: 'Dirección eliminada correctamente',
    })

  } catch (error) {
    console.error('Error eliminando dirección:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 