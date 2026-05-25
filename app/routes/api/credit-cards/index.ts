import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/credit-cards/')({})

export const APIRoute = createAPIFileRoute('/api/credit-cards/')({
  GET: async () => {
    const { listCreditCards } = await import('@/features/finance/api/credit-cards')
    const cards = await listCreditCards()
    return Response.json(cards)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const { createCreditCard } = await import('@/features/finance/api/credit-cards')
    const card = await createCreditCard(body)
    return Response.json(card)
  },
})

