import { NextRequest, NextResponse } from 'next/server'
import { prisma, executeWithRetry } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean)
    const colors = searchParams.get('colors')?.split(',').filter(Boolean)
    const sortBy = searchParams.get('sortBy') || 'newest'

    console.log('API Products - Filters received:', { search, category, minPrice, maxPrice, sizes, colors, sortBy })

    // Build where clause - start with base conditions
    const where: any = {
      isActive: true,
    }

    // Search filter (takes priority over category)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ]
    } else if (category) {
      // Category filter only when not searching
      if (category === 'ofertas') {
        // For offers, we'll filter after querying to avoid complex Prisma queries
        // Just get all products for now and filter in post-processing
      } else {
        where.category = {
          slug: category
        }
      }
    }

    // Build variant conditions separately
    const variantConditions: any[] = []

    // Price range filter
    if (minPrice || maxPrice) {
      variantConditions.push({
        price: {
          ...(minPrice ? { gte: parseInt(minPrice) } : {}),
          ...(maxPrice ? { lte: parseInt(maxPrice) } : {})
        }
      })
    }

    // Size filter
    if (sizes && sizes.length > 0) {
      variantConditions.push({
        size: { in: sizes }
      })
    }

    // Color filter
    if (colors && colors.length > 0) {
      variantConditions.push({
        color: { in: colors }
      })
    }

    // Always require stock > 0
    variantConditions.push({
      stock: { gt: 0 }
    })

    // Apply variant conditions (but not for offers category)
    if (variantConditions.length > 0 && category !== 'ofertas') {
      where.variants = {
        some: {
          AND: variantConditions
        }
      }
    }

    console.log('API Products - Final where clause:', JSON.stringify(where, null, 2))

    // Sorting
    let orderBy: any = []
    switch (sortBy) {
      case 'price-low':
        orderBy = [{ basePrice: 'asc' }]
        break
      case 'price-high':
        orderBy = [{ basePrice: 'desc' }]
        break
      case 'name':
        orderBy = [{ name: 'asc' }]
        break
      case 'popular':
        orderBy = [{ isFeatured: 'desc' }, { name: 'asc' }]
        break
      case 'rating':
        orderBy = [{ isFeatured: 'desc' }, { isNew: 'desc' }]
        break
      case 'newest':
      default:
        orderBy = [
          { isFeatured: 'desc' },
          { isNew: 'desc' },
          { createdAt: 'desc' }
        ]
        break
    }

    // Ejecutar query con reintentos
    const products = await executeWithRetry(async () => {
      return await prisma.product.findMany({
        where,
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
        },
        orderBy
      })
    })

    console.log(`API Products - Found ${products.length} products`)

    // Filter out products with no variants (shouldn't happen but safety check)
    const productsWithVariants = products.filter(p => p.variants.length > 0)

    // Post-process filtering for offers
    let finalProducts = productsWithVariants
    if (category === 'ofertas' && !search) {
      finalProducts = productsWithVariants.filter(product => 
        product.variants.some(variant => 
          variant.originalPrice && 
          Number(variant.originalPrice) > 0 && 
          Number(variant.price) < Number(variant.originalPrice)
        )
      )
    }

    // Transform the data to match frontend expectations
    const transformedProducts = finalProducts.map(product => ({
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
    }))

    console.log(`API Products - Returning ${transformedProducts.length} transformed products`)

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Como fallback temporal, devolver un array vacío con mensaje informativo
    return NextResponse.json([], {
      headers: {
        'X-Error-Message': 'Temporary database connection issue'
      }
    })
  }
} 