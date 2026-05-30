import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/investment-transactions/')({})

export const APIRoute = {
  path: '/api/investment-transactions/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const url = new URL(request.url)
      const assetId = url.searchParams.get('assetId') || undefined
      const { listInvestmentTransactions } = await import('@/features/investments/api/investment-transactions')
      const transactions = await listInvestmentTransactions(effectiveUserId, assetId)
      return Response.json(transactions)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      try {
        const body = await request.json()
        const { createInvestmentTransaction } = await import('@/features/investments/api/investment-transactions')
        const tx = await createInvestmentTransaction(session.user.id, body)
        return Response.json(tx)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao criar transação' }, { status: 500 })
      }
    },
  },
}

