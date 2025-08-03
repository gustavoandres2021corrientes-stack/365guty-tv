
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'
import bcryptjs from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null
        }

        // Verificar si es la clave de administrador (hardcoded por seguridad)
        if (credentials.password === 'admin365guty') {
          // Buscar o crear usuario admin
          let adminUser = await prisma.user.findFirst({
            where: { isAdmin: true }
          })

          if (!adminUser) {
            // Crear usuario admin si no existe
            const hashedPassword = await bcryptjs.hash(credentials.password, 12)
            adminUser = await prisma.user.create({
              data: {
                name: 'Administrador',
                password: hashedPassword,
                dni: null,
                isAdmin: true
              }
            })
          } else {
            // Actualizar último login
            adminUser = await prisma.user.update({
              where: { id: adminUser.id },
              data: {
                lastLogin: new Date()
              }
            })
          }

          return {
            id: adminUser.id,
            name: adminUser.name,
            isAdmin: adminUser.isAdmin
          }
        }

        // Para usuarios normales, buscar por contraseña hasheada
        const users = await prisma.user.findMany({
          where: { isAdmin: false }
        })

        for (const user of users) {
          const isValid = await bcryptjs.compare(credentials.password, user.password)
          if (isValid) {
            // Verificar si el usuario está suspendido
            if (user.status === 'suspended') {
              throw new Error('Tu cuenta ha sido suspendida. Contacta al administrador.')
            }

            // Verificar si el usuario está inactivo
            if (user.status === 'inactive') {
              throw new Error('Tu cuenta está inactiva. Contacta al administrador.')
            }

            // Verificar si es usuario demo y si ha expirado
            if (user.userType === 'demo' && user.demoExpiresAt) {
              const now = new Date()
              if (now > user.demoExpiresAt) {
                throw new Error('Tu período de prueba ha expirado. Contacta al administrador para contratar el servicio.')
              }
            }

            // Actualizar último login
            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: {
                lastLogin: new Date()
              }
            })

            return {
              id: updatedUser.id,
              name: updatedUser.name,
              isAdmin: updatedUser.isAdmin,
              userType: updatedUser.userType,
              status: updatedUser.status,
              demoExpiresAt: updatedUser.demoExpiresAt
            }
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin || false
        token.userType = (user as any).userType || 'standard'
        token.status = (user as any).status || 'active'
        token.demoExpiresAt = (user as any).demoExpiresAt
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ''
        session.user.isAdmin = token.isAdmin || false
        session.user.userType = token.userType || 'standard'
        session.user.status = token.status || 'active'
        session.user.demoExpiresAt = token.demoExpiresAt
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
}
