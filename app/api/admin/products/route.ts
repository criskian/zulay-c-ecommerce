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

    // Verificar que el usuario sea admin (temporal - verificar con email específico)
    if (session.user.email !== 'pan@queso.com') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    // Obtener todos los productos con información de variantes
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        variants: {
          select: {
            id: true,
            stock: true
          }
        },
        _count: {
          select: {
            variants: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { isNew: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transformar los datos para la respuesta
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      basePrice: Number(product.basePrice),
      stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
      isActive: product.isActive,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
      createdAt: product.createdAt.toISOString(),
      variantCount: product._count.variants
    }))

    return NextResponse.json(transformedProducts)

  } catch (error) {
    console.error('Error obteniendo productos (admin):', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea admin (temporal - verificar con email específico)
    if (session.user.email !== 'pan@queso.com') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Aquí iría la lógica para crear un nuevo producto
    // Por ahora retornamos un mensaje de éxito
    
    return NextResponse.json({
      message: 'Producto creado exitosamente',
      productId: 'nuevo-producto-id'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 