import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/investment-transactions/')({})

export const APIRoute = createAPIFileRoute('/api/investment-transactions/')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const assetId = url.searchParams.get('assetId') || undefined
    const { listInvestmentTransactions } = await import('@/features/investments/api/investment-transactions')
    const transactions = await listInvestmentTransactions(assetId)
    return Response.json(transactions)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const { createInvestmentTransaction } = await import('@/features/investments/api/investment-transactions')
    const transaction = await createInvestmentTransaction(body)
    return Response.json(transaction)
  },
})

