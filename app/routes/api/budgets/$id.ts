import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/budgets/$id')({})

export const APIRoute = {
  path: '/api/budgets/$id',
  methods: {
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { deleteBudget } = await import('@/features/finance/api/budgets')
      await deleteBudget(session.user.id, params.id)
      return new Response(null, { status: 204 })
    },
  },
}

