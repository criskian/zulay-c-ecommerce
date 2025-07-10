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
  
  // === ZAPATOS ===
  const zapatoElegante = await prisma.product.upsert({
    where: { slug: 'zapatos-elegantes-negros' },
    update: {},
    create: {
      name: 'Zapatos Elegantes Negros',
      slug: 'zapatos-elegantes-negros',
      description: 'Zapatos de cuero genuino perfectos para ocasiones formales. Fabricados artesanalmente en Colombia con los mejores materiales.',
      basePrice: 189000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Cuero genuino',
        origen: 'Hecho en Colombia',
        cuidado: 'Limpiar con paño húmedo',
        garantia: '6 meses'
      },
      metaTitle: 'Zapatos Elegantes Negros de Cuero | Zulay C',
      metaDescription: 'Zapatos elegantes negros de cuero genuino, perfectos para ocasiones formales. Calidad colombiana.',
      isNew: true,
      isFeatured: true,
      categoryId: categoriaZapatos.id,
    },
  })

  const zapatoDeportivo = await prisma.product.upsert({
    where: { slug: 'zapatos-deportivos' },
    update: {},
    create: {
      name: 'Zapatos Deportivos',
      slug: 'zapatos-deportivos',
      description: 'Zapatos deportivos cómodos y versátiles, ideales para el uso diario. Diseño moderno con tecnología de amortiguación.',
      basePrice: 165000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Sintético transpirable',
        suela: 'Goma antideslizante',
        uso: 'Casual y deportivo'
      },
      isNew: true,
      isFeatured: false,
      categoryId: categoriaZapatos.id,
    },
  })

  const zapatoCueroArtesanal = await prisma.product.upsert({
    where: { slug: 'zapatos-de-cuero-artesanal' },
    update: {},
    create: {
      name: 'Zapatos de Cuero Artesanal',
      slug: 'zapatos-de-cuero-artesanal',
      description: 'Zapatos artesanales de cuero premium hechos a mano por maestros zapateros colombianos. Diseño único y calidad excepcional.',
      basePrice: 250000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Cuero artesanal premium',
        elaboracion: 'Hecho a mano',
        tiempo_fabricacion: '15 días',
        garantia: '1 año'
      },
      isNew: true,
      isFeatured: true,
      categoryId: categoriaZapatos.id,
    },
  })

  const zapatosCasualesOferta = await prisma.product.upsert({
    where: { slug: 'zapatos-casuales-oferta' },
    update: {},
    create: {
      name: 'Zapatos Casuales Oferta',
      slug: 'zapatos-casuales-oferta',
      description: 'Zapatos casuales cómodos para el día a día. Perfectos para combinar con cualquier outfit casual.',
      basePrice: 120000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Cuero sintético',
        suela: 'Antideslizante',
        uso: 'Casual diario'
      },
      isNew: false,
      isFeatured: false,
      categoryId: categoriaZapatos.id,
    },
  })

  const zapatosOxford = await prisma.product.upsert({
    where: { slug: 'zapatos-oxford-clasicos' },
    update: {},
    create: {
      name: 'Zapatos Oxford Clásicos',
      slug: 'zapatos-oxford-clasicos',
      description: 'Zapatos Oxford de diseño clásico y atemporal. Perfectos para ocasiones formales y de negocios.',
      basePrice: 210000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        estilo: 'Oxford clásico',
        material: 'Cuero bovino',
        suela: 'Cuero natural',
        cordones: 'Incluidos'
      },
      isNew: false,
      isFeatured: true,
      categoryId: categoriaZapatos.id,
    },
  })

  // === CORREAS ===
  const correaPremium = await prisma.product.upsert({
    where: { slug: 'correa-de-cuero-premium' },
    update: {},
    create: {
      name: 'Correa de Cuero Premium',
      slug: 'correa-de-cuero-premium',
      description: 'Correa de cuero premium con hebilla de metal plateado. Perfecta para completar tu look elegante.',
      basePrice: 85000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Cuero premium',
        hebilla: 'Metal plateado',
        ancho: '3.5 cm',
        longitud: 'Ajustable'
      },
      isNew: false,
      isFeatured: true,
      categoryId: categoriaCorreas.id,
    },
  })

  const correaCasual = await prisma.product.upsert({
    where: { slug: 'correa-casual-marron' },
    update: {},
    create: {
      name: 'Correa Casual Marrón',
      slug: 'correa-casual-marron',
      description: 'Correa casual de cuero marrón ideal para uso diario. Diseño versátil que combina con cualquier outfit.',
      basePrice: 65000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Cuero natural',
        color: 'Marrón',
        hebilla: 'Metal dorado',
        estilo: 'Casual'
      },
      isNew: false,
      isFeatured: false,
      categoryId: categoriaCorreas.id,
    },
  })

  const correaEleganteDescuento = await prisma.product.upsert({
    where: { slug: 'correa-elegante-descuento' },
    update: {},
    create: {
      name: 'Correa Elegante Descuento',
      slug: 'correa-elegante-descuento',
      description: 'Correa elegante de cuero negro con descuento especial. Perfecta para ocasiones formales.',
      basePrice: 60000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Cuero elegante',
        color: 'Negro',
        hebilla: 'Metal premium',
        oferta: 'Precio especial'
      },
      isNew: false,
      isFeatured: false,
      categoryId: categoriaCorreas.id,
    },
  })

  const correaTrenzada = await prisma.product.upsert({
    where: { slug: 'correa-trenzada-artesanal' },
    update: {},
    create: {
      name: 'Correa Trenzada Artesanal',
      slug: 'correa-trenzada-artesanal',
      description: 'Correa trenzada hecha a mano por artesanos colombianos. Diseño único y exclusivo.',
      basePrice: 95000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        elaboracion: 'Trenzado artesanal',
        material: 'Cuero genuino',
        origen: 'Artesanal colombiano',
        diseño: 'Único'
      },
      isNew: true,
      isFeatured: true,
      categoryId: categoriaCorreas.id,
    },
  })

  // === CAMISETAS ===
  const camisetaCasual = await prisma.product.upsert({
    where: { slug: 'camiseta-casual-blanca' },
    update: {},
    create: {
      name: 'Camiseta Casual Blanca',
      slug: 'camiseta-casual-blanca',
      description: 'Camiseta básica de algodón 100% colombiano. Suave, cómoda y perfecta para cualquier ocasión casual.',
      basePrice: 45000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: '100% Algodón colombiano',
        corte: 'Regular fit',
        cuidado: 'Lavable en máquina',
        origen: 'Hecho en Colombia'
      },
      isNew: false,
      isFeatured: false,
      categoryId: categoriaCamisetas.id,
    },
  })

  const camisetaPolo = await prisma.product.upsert({
    where: { slug: 'camiseta-polo-azul' },
    update: {},
    create: {
      name: 'Camiseta Polo Azul',
      slug: 'camiseta-polo-azul',
      description: 'Camiseta polo de algodón premium en color azul. Estilo elegante y casual para cualquier ocasión.',
      basePrice: 55000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        estilo: 'Polo',
        material: 'Algodón premium',
        color: 'Azul',
        cuello: 'Con botones'
      },
      isNew: false,
      isFeatured: false,
      categoryId: categoriaCamisetas.id,
    },
  })

  const camisetaPremiumAlgodon = await prisma.product.upsert({
    where: { slug: 'camiseta-premium-algodon' },
    update: {},
    create: {
      name: 'Camiseta Premium Algodón',
      slug: 'camiseta-premium-algodon',
      description: 'Camiseta premium de algodón orgánico. Suavidad excepcional y durabilidad garantizada.',
      basePrice: 75000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        material: 'Algodón orgánico premium',
        certificacion: 'Orgánico certificado',
        calidad: 'Premium',
        tacto: 'Ultra suave'
      },
      isNew: false,
      isFeatured: true,
      categoryId: categoriaCamisetas.id,
    },
  })

  const camisetaDeportiva = await prisma.product.upsert({
    where: { slug: 'camiseta-deportiva-tecnica' },
    update: {},
    create: {
      name: 'Camiseta Deportiva Técnica',
      slug: 'camiseta-deportiva-tecnica',
      description: 'Camiseta técnica para actividades deportivas. Tecnología de secado rápido y control de humedad.',
      basePrice: 68000,
      images: ['/placeholder.svg?height=400&width=400'],
      specifications: {
        tecnologia: 'Secado rápido',
        material: 'Poliéster técnico',
        caracteristicas: 'Antibacterial',
        uso: 'Deportivo'
      },
      isNew: true,
      isFeatured: false,
      categoryId: categoriaCamisetas.id,
    },
  })

  // 3. Crear variantes de productos
  console.log('🎨 Creando variantes...')
  
  // Variantes para zapatos elegantes negros
  await prisma.productVariant.createMany({
    data: [
      { sku: 'ZAP-ELE-NEG-36', color: 'Negro', size: '36', price: 189000, stock: 8, productId: zapatoElegante.id },
      { sku: 'ZAP-ELE-NEG-37', color: 'Negro', size: '37', price: 189000, stock: 10, productId: zapatoElegante.id },
      { sku: 'ZAP-ELE-NEG-38', color: 'Negro', size: '38', price: 189000, stock: 12, productId: zapatoElegante.id },
      { sku: 'ZAP-ELE-NEG-39', color: 'Negro', size: '39', price: 189000, stock: 15, productId: zapatoElegante.id },
      { sku: 'ZAP-ELE-NEG-40', color: 'Negro', size: '40', price: 189000, stock: 18, productId: zapatoElegante.id },
      { sku: 'ZAP-ELE-CAF-38', color: 'Café', size: '38', price: 189000, stock: 6, productId: zapatoElegante.id },
      { sku: 'ZAP-ELE-CAF-39', color: 'Café', size: '39', price: 189000, stock: 8, productId: zapatoElegante.id },
      { sku: 'ZAP-ELE-CAF-40', color: 'Café', size: '40', price: 189000, stock: 10, productId: zapatoElegante.id },
    ],
    skipDuplicates: true,
  })

  // Variantes para zapatos deportivos
  await prisma.productVariant.createMany({
    data: [
      { sku: 'ZAP-DEP-BLA-36', color: 'Blanco', size: '36', price: 165000, stock: 5, productId: zapatoDeportivo.id },
      { sku: 'ZAP-DEP-BLA-37', color: 'Blanco', size: '37', price: 165000, stock: 8, productId: zapatoDeportivo.id },
      { sku: 'ZAP-DEP-BLA-38', color: 'Blanco', size: '38', price: 165000, stock: 12, productId: zapatoDeportivo.id },
      { sku: 'ZAP-DEP-BLA-39', color: 'Blanco', size: '39', price: 165000, stock: 10, productId: zapatoDeportivo.id },
      { sku: 'ZAP-DEP-BLA-40', color: 'Blanco', size: '40', price: 165000, stock: 15, productId: zapatoDeportivo.id },
      { sku: 'ZAP-DEP-NEG-38', color: 'Negro', size: '38', price: 165000, stock: 7, productId: zapatoDeportivo.id },
      { sku: 'ZAP-DEP-NEG-39', color: 'Negro', size: '39', price: 165000, stock: 9, productId: zapatoDeportivo.id },
      { sku: 'ZAP-DEP-NEG-40', color: 'Negro', size: '40', price: 165000, stock: 12, productId: zapatoDeportivo.id },
    ],
    skipDuplicates: true,
  })

  // Variantes para zapatos casuales oferta (CON DESCUENTO)
  await prisma.productVariant.createMany({
    data: [
      { sku: 'ZAP-CAS-CAF-36', color: 'Café', size: '36', price: 120000, originalPrice: 160000, stock: 8, productId: zapatosCasualesOferta.id },
      { sku: 'ZAP-CAS-CAF-37', color: 'Café', size: '37', price: 120000, originalPrice: 160000, stock: 10, productId: zapatosCasualesOferta.id },
      { sku: 'ZAP-CAS-CAF-38', color: 'Café', size: '38', price: 120000, originalPrice: 160000, stock: 12, productId: zapatosCasualesOferta.id },
      { sku: 'ZAP-CAS-NEG-37', color: 'Negro', size: '37', price: 120000, originalPrice: 160000, stock: 6, productId: zapatosCasualesOferta.id },
      { sku: 'ZAP-CAS-NEG-38', color: 'Negro', size: '38', price: 120000, originalPrice: 160000, stock: 8, productId: zapatosCasualesOferta.id },
    ],
    skipDuplicates: true,
  })

  // Variantes para correas
  await prisma.productVariant.createMany({
    data: [
      { sku: 'COR-PREM-NEG-S', color: 'Negro', size: 'S', price: 85000, stock: 15, productId: correaPremium.id },
      { sku: 'COR-PREM-NEG-M', color: 'Negro', size: 'M', price: 85000, stock: 20, productId: correaPremium.id },
      { sku: 'COR-PREM-NEG-L', color: 'Negro', size: 'L', price: 85000, stock: 18, productId: correaPremium.id },
      { sku: 'COR-PREM-CAF-M', color: 'Café', size: 'M', price: 85000, stock: 12, productId: correaPremium.id },
      { sku: 'COR-PREM-CAF-L', color: 'Café', size: 'L', price: 85000, stock: 10, productId: correaPremium.id },
      { sku: 'COR-PREM-MAR-M', color: 'Marrón', size: 'M', price: 85000, stock: 8, productId: correaPremium.id },
    ],
    skipDuplicates: true,
  })

  // Variantes para correa elegante descuento (CON DESCUENTO)
  await prisma.productVariant.createMany({
    data: [
      { sku: 'COR-ELE-NEG-S', color: 'Negro', size: 'S', price: 60000, originalPrice: 80000, stock: 12, productId: correaEleganteDescuento.id },
      { sku: 'COR-ELE-NEG-M', color: 'Negro', size: 'M', price: 60000, originalPrice: 80000, stock: 15, productId: correaEleganteDescuento.id },
      { sku: 'COR-ELE-NEG-L', color: 'Negro', size: 'L', price: 60000, originalPrice: 80000, stock: 10, productId: correaEleganteDescuento.id },
      { sku: 'COR-ELE-MAR-M', color: 'Marrón', size: 'M', price: 60000, originalPrice: 80000, stock: 8, productId: correaEleganteDescuento.id },
    ],
    skipDuplicates: true,
  })

  // Variantes para camisetas
  await prisma.productVariant.createMany({
    data: [
      { sku: 'CAM-CAS-BLA-S', color: 'Blanco', size: 'S', price: 45000, stock: 25, productId: camisetaCasual.id },
      { sku: 'CAM-CAS-BLA-M', color: 'Blanco', size: 'M', price: 45000, stock: 30, productId: camisetaCasual.id },
      { sku: 'CAM-CAS-BLA-L', color: 'Blanco', size: 'L', price: 45000, stock: 28, productId: camisetaCasual.id },
      { sku: 'CAM-CAS-BLA-XL', color: 'Blanco', size: 'XL', price: 45000, stock: 20, productId: camisetaCasual.id },
      { sku: 'CAM-CAS-NEG-M', color: 'Negro', size: 'M', price: 45000, stock: 15, productId: camisetaCasual.id },
      { sku: 'CAM-CAS-NEG-L', color: 'Negro', size: 'L', price: 45000, stock: 18, productId: camisetaCasual.id },
      { sku: 'CAM-CAS-GRI-M', color: 'Gris', size: 'M', price: 45000, stock: 12, productId: camisetaCasual.id },
    ],
    skipDuplicates: true,
  })

  // Variantes para camiseta premium algodón (CON DESCUENTO)
  await prisma.productVariant.createMany({
    data: [
      { sku: 'CAM-PREM-BLA-S', color: 'Blanco', size: 'S', price: 75000, originalPrice: 95000, stock: 15, productId: camisetaPremiumAlgodon.id },
      { sku: 'CAM-PREM-BLA-M', color: 'Blanco', size: 'M', price: 75000, originalPrice: 95000, stock: 20, productId: camisetaPremiumAlgodon.id },
      { sku: 'CAM-PREM-BLA-L', color: 'Blanco', size: 'L', price: 75000, originalPrice: 95000, stock: 18, productId: camisetaPremiumAlgodon.id },
      { sku: 'CAM-PREM-NEG-M', color: 'Negro', size: 'M', price: 75000, originalPrice: 95000, stock: 12, productId: camisetaPremiumAlgodon.id },
      { sku: 'CAM-PREM-AZU-M', color: 'Azul', size: 'M', price: 75000, originalPrice: 95000, stock: 10, productId: camisetaPremiumAlgodon.id },
      { sku: 'CAM-PREM-GRI-L', color: 'Gris', size: 'L', price: 75000, originalPrice: 95000, stock: 8, productId: camisetaPremiumAlgodon.id },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completado exitosamente!')
  console.log('📊 Productos creados:')
  console.log('   - Zapatos: 5 productos')
  console.log('   - Correas: 4 productos') 
  console.log('   - Camisetas: 4 productos')
  console.log('   - Total: 13 productos con múltiples variantes')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 