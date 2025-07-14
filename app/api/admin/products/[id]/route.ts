import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET - Obtener un producto específico
export async function GET(
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

    // Verificar que el usuario sea admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error obteniendo producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un producto
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

    // Verificar que el usuario sea admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el producto y sus variantes en una transacción
    await prisma.$transaction(async (tx) => {
      // Primero eliminar todas las variantes del producto
      await tx.productVariant.deleteMany({
        where: { productId: params.id }
      })

      // Luego eliminar el producto
      await tx.product.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({
      message: 'Producto eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar propiedades específicas de un producto (como estado activo/inactivo)
export async function PATCH(
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

    // Verificar que el usuario sea admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isActive, isFeatured, isNew } = body

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isNew !== undefined && { isNew }),
      }
    })

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error actualizando producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 