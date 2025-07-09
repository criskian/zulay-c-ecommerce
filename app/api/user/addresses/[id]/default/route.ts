import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// PUT - Establecer dirección como predeterminada
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

    // Quitar el flag de predeterminada de todas las direcciones del usuario
    await prisma.address.updateMany({
      where: { 
        userId: user.id,
        isDefault: true
      },
      data: { isDefault: false }
    })

    // Establecer esta dirección como predeterminada
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: { isDefault: true }
    })

    console.log(`✅ Dirección predeterminada actualizada: ${params.id} para usuario: ${user.email}`)
    
    return NextResponse.json({
      message: 'Dirección predeterminada actualizada correctamente',
      address: updatedAddress,
    })

  } catch (error) {
    console.error('Error actualizando dirección predeterminada:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 