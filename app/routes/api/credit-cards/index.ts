import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/credit-cards/')({})

export const APIRoute = {
  path: '/api/credit-cards/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { listCreditCards } = await import('@/features/finance/api/credit-cards')
      const cards = await listCreditCards(session.user.id)
      return Response.json(cards)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const body = await request.json()
      const { createCreditCard } = await import('@/features/finance/api/credit-cards')
      const card = await createCreditCard(session.user.id, body)
      return Response.json(card)
    },
  },
}

