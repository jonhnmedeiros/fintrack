import { createAPIFileRoute } from '@tanstack/start'
import * as transactionsApi from '@/features/finance/api/transactions'

export const APIRoute = createAPIFileRoute('/api/transactions/')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const filters = {
      type: url.searchParams.get('type') || undefined,
      categoryId: url.searchParams.get('categoryId') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    }
    const transactions = await transactionsApi.listTransactions(filters)
    return Response.json(transactions)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const transaction = await transactionsApi.createTransaction(body)
    return Response.json(transaction)
  },
})
