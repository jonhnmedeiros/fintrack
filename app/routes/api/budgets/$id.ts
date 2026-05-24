import { createAPIFileRoute } from '@tanstack/start'
import * as budgetsApi from '@/features/finance/api/budgets'

export const APIRoute = createAPIFileRoute('/api/budgets/$id')({
  DELETE: async ({ params }) => {
    await budgetsApi.deleteBudget(params.id)
    return new Response(null, { status: 204 })
  },
})
