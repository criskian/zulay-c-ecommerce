import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productParam = params.id

    // Try to find product by slug first, then by id
    let product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: productParam },
          { id: productParam }
        ],
        isActive: true
      },
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
            color: true,
            size: true,
            price: true,
            originalPrice: true,
            stock: true
          },
          where: {
            stock: { gt: 0 } // Only include variants with stock
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Filter out products with no variants (shouldn't happen but safety check)
    if (product.variants.length === 0) {
      return NextResponse.json(
        { error: 'Producto sin variantes disponibles' },
        { status: 404 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: Number(product.basePrice),
      images: product.images as string[],
      isNew: product.isNew,
      isFeatured: product.isFeatured,
      category: product.category,
      variants: product.variants.map(variant => ({
        id: variant.id,
        color: variant.color,
        size: variant.size,
        price: Number(variant.price),
        originalPrice: variant.originalPrice ? Number(variant.originalPrice) : undefined,
        stock: variant.stock
      }))
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 