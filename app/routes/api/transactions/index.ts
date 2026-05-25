import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/transactions/')({})

export const APIRoute = createAPIFileRoute('/api/transactions/')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const filters = {
      type: url.searchParams.get('type') || undefined,
      categoryId: url.searchParams.get('categoryId') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    }
    const { listTransactions } = await import('@/features/finance/api/transactions')
    const transactions = await listTransactions(filters)
    return Response.json(transactions)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const { createTransaction } = await import('@/features/finance/api/transactions')
    const transaction = await createTransaction(body)
    return Response.json(transaction)
  },
})

