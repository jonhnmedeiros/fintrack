import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/budgets/$id')({})

export const APIRoute = createAPIFileRoute('/api/budgets/$id')({
  DELETE: async ({ params }) => {
    const { deleteBudget } = await import('@/features/finance/api/budgets')
    await deleteBudget(params.id)
    return new Response(null, { status: 204 })
  },
})

