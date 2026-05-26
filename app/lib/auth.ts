import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuthModule from 'next-auth'
import CredentialsProviderModule from 'next-auth/providers/credentials'
import { decode } from 'next-auth/jwt'
import { signIn, signOut } from 'next-auth/react'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

const NextAuth = (NextAuthModule as any).default ?? NextAuthModule
const CredentialsProvider = (CredentialsProviderModule as any).default ?? CredentialsProviderModule

const nextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
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
}

export const authOptions = nextAuthOptions

const nextAuthHandler = NextAuth(nextAuthOptions)

export const handlers = { GET: nextAuthHandler, POST: nextAuthHandler }
export { signIn, signOut }

export async function auth(request?: Request) {
  try {
    if (!request) return null

    const cookie = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookie.split(';').filter(Boolean).map(c => {
        const [key, ...val] = c.trim().split('=')
        try { return [key, decodeURIComponent(val.join('='))] } catch { return [key, val.join('=')] }
      })
    )

    const isSecure = process.env.NODE_ENV === 'production'
    const cookieName = isSecure
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'

    const raw = cookies[cookieName]
    if (!raw) return null

    const token = await decode({
      token: raw,
      secret: process.env.NEXTAUTH_SECRET!,
    })

    if (!token || !token.sub) return null

    return {
      user: {
        id: token.sub,
        email: (token as any).email as string | undefined,
        name: (token as any).name as string | undefined,
      },
    }
  } catch {
    return null
  }
}
