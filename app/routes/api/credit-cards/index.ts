import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/credit-cards/')({})

export const APIRoute = {
  path: '/api/credit-cards/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { listCreditCards } = await import('@/features/finance/api/credit-cards')
      const cards = await listCreditCards(effectiveUserId)
      return Response.json(cards)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const body = await request.json()
      const { createCreditCard } = await import('@/features/finance/api/credit-cards')
      try {
        const card = await createCreditCard(session.user.id, body)
        return Response.json(card)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao criar cartão' }, { status: 500 })
      }
    },
  },
}
