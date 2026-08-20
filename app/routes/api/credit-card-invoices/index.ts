import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/credit-card-invoices/')({})

export const APIRoute = {
  path: '/api/credit-card-invoices/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const url = new URL(request.url)
      const cardId = url.searchParams.get('cardId')
      if (!cardId) return Response.json({ error: 'cardId é obrigatório' }, { status: 400 })
      const { listInvoices } = await import('@/features/finance/api/credit-cards')
      try {
        const result = await listInvoices(effectiveUserId, cardId)
        return Response.json(result)
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2025') {
          return Response.json({ error: 'Cartão não encontrado' }, { status: 404 })
        }
        return Response.json({ error: 'Erro ao carregar faturas' }, { status: 500 })
      }
    },
  },
}
