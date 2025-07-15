import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma, executeWithRetry } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schema para validar credenciales de login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // Validar credenciales
          const { email, password } = loginSchema.parse(credentials)

          // Buscar usuario por email
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              accounts: {
                where: {
                  provider: 'credentials'
                }
              }
            }
          })

          if (!user) {
            throw new Error('No existe una cuenta con este correo electrónico')
          }

          if (!user.accounts.length) {
            throw new Error('No se encontró información de autenticación para este usuario')
          }

          // Verificar contraseña (guardada en refresh_token del Account)
          const account = user.accounts[0]
          const isPasswordValid = await bcrypt.compare(password, account.refresh_token || '')

          if (!isPasswordValid) {
            throw new Error('La contraseña es incorrecta')
          }

          // Retornar usuario sin datos sensibles
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            phone: user.phone,
            role: user.role || 'CUSTOMER',
          }
        } catch (error) {
          console.error('Error en autorización:', error)
          // Re-lanzar el error para que NextAuth lo pueda manejar
          throw error
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
        token.role = user.role
      } else if (token.email) {
        // Obtener el rol actualizado de la base de datos en cada token refresh
        try {
          const dbUser = await executeWithRetry(async () => {
            return await prisma.user.findUnique({
              where: { email: token.email },
              select: { role: true }
            })
          })
          if (dbUser) {
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error obteniendo rol del usuario:', error)
          // Mantener el rol actual del token si hay error
        }
      }
      return token
    },
    
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.phone = token.phone as string | null
        session.user.role = token.role as string | null
      }
      return session
    }
  },
  
  pages: {
    signIn: '/auth/login',
  },
  
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 