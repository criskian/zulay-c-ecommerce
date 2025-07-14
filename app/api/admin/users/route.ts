import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea admin (temporal)
    if (session.user.email !== 'pan@queso.com') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    // Obtener todos los usuarios con estadísticas de pedidos
    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true,
            paymentStatus: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transformar los datos para la respuesta
    const transformedUsers = users.map(user => {
      const paidOrders = user.orders.filter(order => order.paymentStatus === 'PAID')
      const totalSpent = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)

      return {
        id: user.id,
        name: user.name || 'Usuario sin nombre',
        email: user.email,
        phone: user.phone,
        role: 'CUSTOMER', // Por defecto, hasta que funcione la DB
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        orderCount: user._count.orders,
        totalSpent: totalSpent,
        lastLogin: user.updatedAt.toISOString() // Aproximación
      }
    })

    return NextResponse.json(transformedUsers)

  } catch (error) {
    console.error('Error obteniendo usuarios (admin):', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 