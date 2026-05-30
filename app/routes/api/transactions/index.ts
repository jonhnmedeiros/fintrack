import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/transactions/')({})

export const APIRoute = {
  path: '/api/transactions/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const url = new URL(request.url)
      const filters = {
        type: url.searchParams.get('type') || undefined,
        categoryId: url.searchParams.get('categoryId') || undefined,
        startDate: url.searchParams.get('startDate') || undefined,
        endDate: url.searchParams.get('endDate') || undefined,
      }
      const { listTransactions } = await import('@/features/finance/api/transactions')
      const transactions = await listTransactions(effectiveUserId, filters)
      return Response.json(transactions)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const body = await request.json()
      const { createTransaction } = await import('@/features/finance/api/transactions')
      try {
        const transaction = await createTransaction(session.user.id, body)
        return Response.json(transaction)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao criar transação' }, { status: 500 })
      }
    },
  },
}

