import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/budgets/')({})

export const APIRoute = createAPIFileRoute('/api/budgets/')({
  GET: async ({ request }) => {
    const { listBudgets } = await import('@/features/finance/api/budgets')
    const url = new URL(request.url)
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined
    const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined
    const budgets = await listBudgets(year, month)
    return Response.json(budgets)
  },
  POST: async ({ request }) => {
    const { createOrUpdateBudget } = await import('@/features/finance/api/budgets')
    const body = await request.json()
    const budget = await createOrUpdateBudget(body)
    return Response.json(budget)
  },
})

