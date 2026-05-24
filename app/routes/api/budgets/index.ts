import { createAPIFileRoute } from '@tanstack/start'
import * as budgetsApi from '@/features/finance/api/budgets'

export const APIRoute = createAPIFileRoute('/api/budgets')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined
    const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined
    const budgets = await budgetsApi.listBudgets(year, month)
    return Response.json(budgets)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const budget = await budgetsApi.createOrUpdateBudget(body)
    return Response.json(budget)
  },
})
