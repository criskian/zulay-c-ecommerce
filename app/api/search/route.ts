import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 1) {
      return NextResponse.json([])
    }

    const cleanQuery = query.trim()

    // Búsqueda de productos con coincidencias en nombre, descripción y categoría
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              {
                name: {
                  contains: cleanQuery,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: cleanQuery,
                  mode: 'insensitive'
                }
              },
              {
                category: {
                  name: {
                    contains: cleanQuery,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: limit,
      orderBy: [
        { isFeatured: 'desc' },
        { isNew: 'desc' },
        { name: 'asc' }
      ]
    })

    // Transformar los datos para la respuesta
    const searchResults = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      images: product.images as string[],
      category: product.category,
      isNew: product.isNew,
      isFeatured: product.isFeatured
    }))

    return NextResponse.json(searchResults)
  } catch (error) {
    console.error('Error en búsqueda de productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 