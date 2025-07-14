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

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    // Calcular fecha de inicio basada en el período
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Consultas paralelas para eficiencia
    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      topProducts,
      salesByCategory,
      monthlyData
    ] = await Promise.all([
      // Ingresos totales
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'PAID'
        },
        _sum: { totalAmount: true },
        _count: true
      }),

      // Total de pedidos
      prisma.order.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Total de usuarios
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Total de productos activos
      prisma.product.count({
        where: { isActive: true }
      }),

      // Productos más vendidos
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
            paymentStatus: 'PAID'
          }
        },
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),

      // Ventas por categoría
      prisma.product.findMany({
        include: {
          category: true,
          orderItems: {
            where: {
              order: {
                createdAt: { gte: startDate },
                paymentStatus: 'PAID'
              }
            },
            select: {
              quantity: true,
              totalPrice: true
            }
          }
        }
      }),

      // Datos mensuales (últimos 6 meses)
      prisma.order.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
          paymentStatus: 'PAID'
        },
        select: {
          createdAt: true,
          totalAmount: true
        }
      })
    ])

    // Procesar datos de productos más vendidos
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true }
        })
        return {
          id: item.productId,
          name: product?.name || 'Producto eliminado',
          category: product?.category.name || 'Sin categoría',
          soldQuantity: item._sum.quantity || 0,
          revenue: Number(item._sum.totalPrice || 0)
        }
      })
    )

    // Procesar ventas por categoría
    const categoryStats = new Map()
    salesByCategory.forEach(product => {
      const categoryName = product.category.name
      const categoryData = categoryStats.get(categoryName) || { quantity: 0, revenue: 0 }
      
      product.orderItems.forEach(item => {
        categoryData.quantity += item.quantity
        categoryData.revenue += Number(item.totalPrice)
      })
      
      categoryStats.set(categoryName, categoryData)
    })

    const totalCategoryRevenue = Array.from(categoryStats.values())
      .reduce((sum, cat) => sum + cat.revenue, 0)

    const salesByCategoryArray = Array.from(categoryStats.entries()).map(([category, data]) => ({
      category,
      quantity: data.quantity,
      revenue: data.revenue,
      percentage: totalCategoryRevenue > 0 ? (data.revenue / totalCategoryRevenue) * 100 : 0
    }))

    // Procesar datos mensuales
    const monthlyStats = new Map()
    monthlyData.forEach(order => {
      const monthKey = order.createdAt.toISOString().slice(0, 7) // YYYY-MM
      const current = monthlyStats.get(monthKey) || { revenue: 0, orders: 0 }
      current.revenue += Number(order.totalAmount)
      current.orders += 1
      monthlyStats.set(monthKey, current)
    })

    const monthlyRevenueArray = Array.from(monthlyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('es-CO', { 
          year: 'numeric', 
          month: 'long' 
        }),
        revenue: data.revenue,
        orders: data.orders
      }))

    // Calcular crecimiento (simplificado - comparar con período anterior)
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - period)

    const previousRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: previousPeriodStart, lt: startDate },
        paymentStatus: 'PAID'
      },
      _sum: { totalAmount: true }
    })

    const previousOrders = await prisma.order.count({
      where: { createdAt: { gte: previousPeriodStart, lt: startDate } }
    })

    const previousUsers = await prisma.user.count({
      where: { createdAt: { gte: previousPeriodStart, lt: startDate } }
    })

    const currentRevenue = Number(totalRevenue._sum.totalAmount || 0)
    const prevRevenue = Number(previousRevenue._sum.totalAmount || 0)
    
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0
    const ordersGrowth = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0
    const usersGrowth = previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0

    const reportData = {
      overview: {
        totalRevenue: currentRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        revenueGrowth,
        ordersGrowth,
        usersGrowth
      },
      topProducts: topProductsWithDetails,
      salesByCategory: salesByCategoryArray,
      monthlyRevenue: monthlyRevenueArray
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Error generando reportes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 