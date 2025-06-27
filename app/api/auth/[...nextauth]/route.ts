import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
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

          if (!user || !user.accounts.length) {
            return null
          }

          // Verificar contraseña (guardada en refresh_token del Account)
          const account = user.accounts[0]
          const isPasswordValid = await bcrypt.compare(password, account.refresh_token || '')

          if (!isPasswordValid) {
            return null
          }

          // Retornar usuario sin datos sensibles
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            phone: user.phone,
          }
        } catch (error) {
          console.error('Error en autorización:', error)
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.phone = token.phone as string | null
      }
      return session
    }
  },
  
  pages: {
    signIn: '/auth/login',
    // error: '/auth/error', // Página de error personalizada (opcional)
  },
  
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 