import { createAPIFileRoute } from '@tanstack/start'
import * as invTxApi from '@/features/investments/api/investment-transactions'

export const APIRoute = createAPIFileRoute('/api/investment-transactions/')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const assetId = url.searchParams.get('assetId') || undefined
    const transactions = await invTxApi.listInvestmentTransactions(assetId)
    return Response.json(transactions)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const transaction = await invTxApi.createInvestmentTransaction(body)
    return Response.json(transaction)
  },
})
