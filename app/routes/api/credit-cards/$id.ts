import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/credit-cards/$id')({})

export const APIRoute = createAPIFileRoute('/api/credit-cards/$id')({
  DELETE: async ({ params }) => {
    const { deleteCreditCard } = await import('@/features/finance/api/credit-cards')
    await deleteCreditCard(params.id)
    return new Response(null, { status: 204 })
  },
})

