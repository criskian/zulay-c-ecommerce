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

    // Obtener todos los pedidos con información del usuario
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transformar los datos para la respuesta
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.name || 'Usuario sin nombre',
      customerEmail: order.user.email,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: Number(order.totalAmount),
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString()
    }))

    return NextResponse.json(transformedOrders)

  } catch (error) {
    console.error('Error obteniendo pedidos (admin):', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 