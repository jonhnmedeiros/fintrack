import { createAPIFileRoute } from '@tanstack/start'
import * as creditCardsApi from '@/features/finance/api/credit-cards'

export const APIRoute = createAPIFileRoute('/api/credit-cards/')({
  GET: async () => {
    const cards = await creditCardsApi.listCreditCards()
    return Response.json(cards)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const card = await creditCardsApi.createCreditCard(body)
    return Response.json(card)
  },
})
