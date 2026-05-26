import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/transactions/$id')({})

export const APIRoute = {
  path: '/api/transactions/$id',
  methods: {
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { deleteTransaction } = await import('@/features/finance/api/transactions')
      await deleteTransaction(session.user.id, params.id)
      return new Response(null, { status: 204 })
    },
  },
}

