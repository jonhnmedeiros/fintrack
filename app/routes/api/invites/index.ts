import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import crypto from 'node:crypto'
export const Route = createFileRoute('/api/invites/')({})

const createInviteSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const APIRoute = {
  path: '/api/invites/',
  methods: {
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role !== 'TITULAR') {
        return Response.json({ error: 'Apenas Titulares podem convidar' }, { status: 403 })
      }

      try {
        const body = await request.json()
        const { email } = createInviteSchema.parse(body)

        if (email === session.user.email) {
          return Response.json({ error: 'Você não pode convidar a si mesmo' }, { status: 400 })
        }

        const { prisma } = await import('@/lib/db')
        const { userDb } = await import('@/lib/tenant-db')
        const db = userDb(session.user.id)

        const existingUser = await prisma.user.findUnique({ where: { email } })

        const existingInvite = await db.invite.findMany({
          where: { email, status: 'PENDING' },
        })
        if (existingInvite.length > 0) {
          return Response.json({ error: 'Já existe um convite pendente para este email' }, { status: 409 })
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await db.invite.create({
          data: {
            email,
            token,
            status: 'PENDING',
            expiresAt,
            inviteeId: existingUser?.id ?? null,
          },
        })

        const { sendInviteEmail } = await import('@/lib/email')
        await sendInviteEmail({
          to: email,
          inviterName: session.user.name || session.user.email || 'Um usuário',
          token,
          isNewUser: !existingUser,
        })

        return Response.json({ success: true })
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Email inválido' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao criar convite' }, { status: 500 })
      }
    },
  },
}
