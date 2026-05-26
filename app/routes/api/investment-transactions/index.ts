import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/investment-transactions/')({})

export const APIRoute = {
  path: '/api/investment-transactions/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const url = new URL(request.url)
      const assetId = url.searchParams.get('assetId') || undefined
      const { listInvestmentTransactions } = await import('@/features/investments/api/investment-transactions')
      const transactions = await listInvestmentTransactions(session.user.id, assetId)
      return Response.json(transactions)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const body = await request.json()
      const { createInvestmentTransaction } = await import('@/features/investments/api/investment-transactions')
      const transaction = await createInvestmentTransaction(session.user.id, body)
      return Response.json(transaction)
    },
  },
}

