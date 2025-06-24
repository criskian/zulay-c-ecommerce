import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear categorías
  console.log('📁 Creando categorías...')
  const categoriaZapatos = await prisma.category.upsert({
    where: { slug: 'zapatos' },
    update: {},
    create: {
      name: 'Zapatos',
      slug: 'zapatos',
      description: 'Calzado elegante y cómodo para toda ocasión',
      image: '/images/categories/zapatos.jpg',
      metaTitle: 'Zapatos de Cuero Colombianos | Zulay C',
      metaDescription: 'Descubre nuestra exclusiva colección de zapatos de cuero genuino fabricados en Colombia',
      sortOrder: 1,
    },
  })

  const categoriaCorreas = await prisma.category.upsert({
    where: { slug: 'correas' },
    update: {},
    create: {
      name: 'Correas',
      slug: 'correas',
      description: 'Correas de cuero auténtico de alta calidad',
      image: '/images/categories/correas.jpg',
      metaTitle: 'Correas de Cuero | Zulay C',
      metaDescription: 'Correas artesanales de cuero colombiano, perfectas para complementar tu estilo',
      sortOrder: 2,
    },
  })

  const categoriaCamisetas = await prisma.category.upsert({
    where: { slug: 'camisetas' },
    update: {},
    create: {
      name: 'Camisetas',
      slug: 'camisetas',
      description: 'Camisetas de algodón 100% colombiano',
      image: '/images/categories/camisetas.jpg',
      metaTitle: 'Camisetas de Algodón | Zulay C',
      metaDescription: 'Camisetas cómodas y de alta calidad hechas con algodón 100% colombiano',
      sortOrder: 3,
    },
  })

  // 2. Crear productos
  console.log('👟 Creando productos...')
  
  // Zapatos
  const zapatoElegante = await prisma.product.upsert({
    where: { slug: 'zapato-elegante-negro' },
    update: {},
    create: {
      name: 'Zapato Elegante Negro',
      slug: 'zapato-elegante-negro',
      description: 'Zapato de cuero genuino perfecto para ocasiones formales. Fabricado artesanalmente en Colombia con los mejores materiales.',
      basePrice: 180000,
      images: [
        '/placeholder.jpg',
        '/placeholder.jpg',
        '/placeholder.jpg'
      ],
      specifications: {
        material: 'Cuero genuino',
        origen: 'Hecho en Colombia',
        cuidado: 'Limpiar con paño húmedo',
        garantia: '6 meses'
      },
      metaTitle: 'Zapato Elegante Negro de Cuero | Zulay C',
      metaDescription: 'Zapato elegante negro de cuero genuino, perfecto para ocasiones formales. Calidad colombiana.',
      isNew: true,
      isFeatured: true,
      categoryId: categoriaZapatos.id,
    },
  })

  const zapatoDeportivo = await prisma.product.upsert({
    where: { slug: 'zapato-deportivo-azul' },
    update: {},
    create: {
      name: 'Zapato Deportivo Azul',
      slug: 'zapato-deportivo-azul',
      description: 'Zapato deportivo cómodo y versátil, ideal para el uso diario. Diseño moderno con tecnología de amortiguación.',
      basePrice: 150000,
      images: [
        '/placeholder.jpg',
        '/placeholder.jpg'
      ],
      specifications: {
        material: 'Sintético transpirable',
        suela: 'Goma antideslizante',
        uso: 'Casual y deportivo'
      },
      isNew: false,
      isFeatured: true,
      categoryId: categoriaZapatos.id,
    },
  })

  // Correas
  const correaPremium = await prisma.product.upsert({
    where: { slug: 'correa-cuero-premium' },
    update: {},
    create: {
      name: 'Correa de Cuero Premium',
      slug: 'correa-cuero-premium',
      description: 'Correa de cuero premium con hebilla de metal. Perfecta para completar tu look elegante.',
      basePrice: 80000,
      images: [
        '/placeholder.jpg',
        '/placeholder.jpg'
      ],
      specifications: {
        material: 'Cuero premium',
        hebilla: 'Metal plateado',
        ancho: '3.5 cm'
      },
      isFeatured: true,
      categoryId: categoriaCorreas.id,
    },
  })

  // Camisetas
  const camisetaAlgodon = await prisma.product.upsert({
    where: { slug: 'camiseta-algodon-blanca' },
    update: {},
    create: {
      name: 'Camiseta de Algodón Blanca',
      slug: 'camiseta-algodon-blanca',
      description: 'Camiseta básica de algodón 100% colombiano. Suave, cómoda y duradera.',
      basePrice: 45000,
      images: [
        '/placeholder.jpg'
      ],
      specifications: {
        material: '100% Algodón colombiano',
        corte: 'Regular fit',
        cuidado: 'Lavable en máquina'
      },
      isNew: true,
      categoryId: categoriaCamisetas.id,
    },
  })

  // 3. Crear variantes de productos
  console.log('🎨 Creando variantes...')
  
  // Variantes para zapato elegante
  await prisma.productVariant.createMany({
    data: [
      {
        sku: 'ZAP-ELE-NEG-39',
        color: 'Negro',
        size: '39',
        price: 180000,
        stock: 10,
        productId: zapatoElegante.id,
      },
      {
        sku: 'ZAP-ELE-NEG-40',
        color: 'Negro',
        size: '40',
        price: 180000,
        stock: 15,
        productId: zapatoElegante.id,
      },
      {
        sku: 'ZAP-ELE-NEG-41',
        color: 'Negro',
        size: '41',
        price: 180000,
        stock: 12,
        productId: zapatoElegante.id,
      },
      {
        sku: 'ZAP-ELE-CAF-40',
        color: 'Café',
        size: '40',
        price: 180000,
        stock: 8,
        productId: zapatoElegante.id,
      },
    ],
  })

  // Variantes para zapato deportivo
  await prisma.productVariant.createMany({
    data: [
      {
        sku: 'ZAP-DEP-AZU-38',
        color: 'Azul',
        size: '38',
        price: 150000,
        originalPrice: 170000,
        stock: 20,
        productId: zapatoDeportivo.id,
      },
      {
        sku: 'ZAP-DEP-AZU-39',
        color: 'Azul',
        size: '39',
        price: 150000,
        originalPrice: 170000,
        stock: 18,
        productId: zapatoDeportivo.id,
      },
      {
        sku: 'ZAP-DEP-BLA-39',
        color: 'Blanco',
        size: '39',
        price: 150000,
        stock: 25,
        productId: zapatoDeportivo.id,
      },
    ],
  })

  // Variantes para correa
  await prisma.productVariant.createMany({
    data: [
      {
        sku: 'COR-PRE-NEG-M',
        color: 'Negro',
        size: 'M',
        price: 80000,
        stock: 30,
        productId: correaPremium.id,
      },
      {
        sku: 'COR-PRE-NEG-L',
        color: 'Negro',
        size: 'L',
        price: 80000,
        stock: 25,
        productId: correaPremium.id,
      },
      {
        sku: 'COR-PRE-CAF-M',
        color: 'Café',
        size: 'M',
        price: 80000,
        stock: 20,
        productId: correaPremium.id,
      },
    ],
  })

  // Variantes para camiseta
  await prisma.productVariant.createMany({
    data: [
      {
        sku: 'CAM-ALG-BLA-S',
        color: 'Blanco',
        size: 'S',
        price: 45000,
        stock: 50,
        productId: camisetaAlgodon.id,
      },
      {
        sku: 'CAM-ALG-BLA-M',
        color: 'Blanco',
        size: 'M',
        price: 45000,
        stock: 60,
        productId: camisetaAlgodon.id,
      },
      {
        sku: 'CAM-ALG-BLA-L',
        color: 'Blanco',
        size: 'L',
        price: 45000,
        stock: 40,
        productId: camisetaAlgodon.id,
      },
    ],
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`📊 Datos creados:`)
  console.log(`   - 3 categorías`)
  console.log(`   - 4 productos`)
  console.log(`   - 13 variantes`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 