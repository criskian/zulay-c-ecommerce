import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET - Obtener un producto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      where: { id },
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

// PUT - Actualizar completamente un producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { 
      name, 
      slug, 
      description, 
      basePrice, 
      categoryId, 
      isActive, 
      isFeatured, 
      isNew, 
      images,
      variants 
    } = body

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el slug no esté en uso por otro producto
    if (slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findFirst({
        where: {
          slug: slug,
          id: { not: id }
        }
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'El slug ya está en uso por otro producto' },
          { status: 400 }
        )
      }
    }

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 400 }
      )
    }

    // Actualizar producto y variantes en una transacción
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Actualizar el producto
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          basePrice,
          categoryId,
          isActive,
          isFeatured,
          isNew,
          images: images || [],
          updatedAt: new Date()
        }
      })

      // Eliminar variantes existentes
      await tx.productVariant.deleteMany({
        where: { productId: id }
      })

      // Crear nuevas variantes
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((variant: any) => ({
            productId: id,
            color: variant.color,
            size: variant.size,
            price: variant.price,
            originalPrice: variant.originalPrice || null,
            stock: variant.stock
          }))
        })
      }

      return product
    })

    // Obtener el producto actualizado con sus relaciones
    const productWithRelations = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variants: true
      }
    })

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
      product: productWithRelations
    })

  } catch (error) {
    console.error('Error actualizando producto completo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 