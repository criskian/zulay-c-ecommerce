import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Singleton pattern para evitar múltiples instancias
export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Función para desconectar Prisma cuando sea necesario
export const disconnectPrisma = async () => {
  await prisma.$disconnect()
}

// Función helper para ejecutar queries con reintentos
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      // Si es el error de prepared statement, intentar crear nueva conexión
      if (error.message?.includes('prepared statement') && attempt < maxRetries) {
        console.warn(`Intento ${attempt} fallido, reintentando en ${delayMs}ms...`)
        
        // Esperar un poco antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delayMs))
        
        // Intentar desconectar y reconectar
        try {
          await prisma.$disconnect()
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (disconnectError) {
          // Ignorar errores de desconexión
        }
        
        continue
      }
      
      // Si no es el error que esperamos o es el último intento, lanzar el error
      throw error
    }
  }
  
  throw new Error('Máximo número de reintentos alcanzado')
} 