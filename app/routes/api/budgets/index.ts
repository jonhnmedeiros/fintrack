import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/budgets/')({})

export const APIRoute = {
  path: '/api/budgets/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { listBudgets } = await import('@/features/finance/api/budgets')
      const url = new URL(request.url)
      const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined
      const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined
      const budgets = await listBudgets(session.user.id, year, month)
      return Response.json(budgets)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { createOrUpdateBudget } = await import('@/features/finance/api/budgets')
      const body = await request.json()
      const budget = await createOrUpdateBudget(session.user.id, body)
      return Response.json(budget)
    },
  },
}

