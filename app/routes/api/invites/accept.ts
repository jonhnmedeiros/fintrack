import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/invites/accept')({})

export const APIRoute = {
  path: '/api/invites/accept',
  methods: {
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

      try {
        const { token } = await request.json()
        if (!token || typeof token !== 'string') {
          return Response.json({ error: 'Token inválido' }, { status: 400 })
        }

        const { prisma } = await import('@/lib/db')

        const invite = await prisma.invite.findUnique({
          where: { token },
        })

        if (!invite) {
          return Response.json({ error: 'Convite não encontrado' }, { status: 404 })
        }

        if (invite.status !== 'PENDING') {
          return Response.json({ error: 'Convite já foi aceito ou expirou' }, { status: 400 })
        }

        if (invite.expiresAt < new Date()) {
          await prisma.invite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } })
          return Response.json({ error: 'Convite expirou' }, { status: 400 })
        }

        if (invite.inviteeId && invite.inviteeId !== session.user.id) {
          return Response.json({ error: 'Este convite é para outro usuário' }, { status: 403 })
        }

        await prisma.invite.update({
          where: { id: invite.id },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date(),
            inviteeId: session.user.id,
          },
        })

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            role: 'VISUALIZADOR',
            viewerOfId: invite.invitedById,
          },
        })

        return Response.json({ success: true })
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao aceitar convite' }, { status: 500 })
      }
    },
  },
}
