import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// POST - Migrar dirección del usuario al nuevo sistema
export async function POST(request: NextRequest) {
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
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya tiene direcciones en el nuevo sistema
    const existingAddresses = await prisma.address.findMany({
      where: { userId: user.id }
    })

    if (existingAddresses.length > 0) {
      return NextResponse.json({
        message: 'El usuario ya tiene direcciones en el nuevo sistema',
        addresses: existingAddresses,
      })
    }

    // Solo migrar si tiene datos de dirección en el modelo User
    if (!user.address || !user.city || !user.state) {
      return NextResponse.json({
        message: 'No hay dirección que migrar',
        migrated: false,
      })
    }

    // Crear nueva dirección basada en los datos del usuario
    const newAddress = await prisma.address.create({
      data: {
        type: 'home',
        title: 'Mi Dirección Principal',
        fullName: user.name || 'Usuario',
        phone: user.phone || '',
        address: user.address,
        neighborhood: 'Centro', // Valor por defecto, el usuario puede editarlo
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        isDefault: true,
        userId: user.id,
      }
    })

    console.log(`✅ Dirección migrada para usuario: ${user.email}`)
    
    return NextResponse.json({
      message: 'Dirección migrada exitosamente',
      migrated: true,
      address: newAddress,
    })

  } catch (error) {
    console.error('Error migrando dirección:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 