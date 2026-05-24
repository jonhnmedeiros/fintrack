import { createAPIFileRoute } from '@tanstack/start'
import * as creditCardsApi from '@/features/finance/api/credit-cards'

export const APIRoute = createAPIFileRoute('/api/credit-cards/$id')({
  DELETE: async ({ params }) => {
    await creditCardsApi.deleteCreditCard(params.id)
    return new Response(null, { status: 204 })
  },
})
