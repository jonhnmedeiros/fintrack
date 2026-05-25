import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuthModule from 'next-auth'
import CredentialsProviderModule from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

const NextAuth = (NextAuthModule as any).default ?? NextAuthModule
const CredentialsProvider = (CredentialsProviderModule as any).default ?? CredentialsProviderModule

export const { handlers: authHandlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub as string,
      },
    }),
  },
  pages: {
    signIn: '/login',
  },
})
