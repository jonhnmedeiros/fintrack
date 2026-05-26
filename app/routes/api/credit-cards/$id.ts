import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/credit-cards/$id')({})

export const APIRoute = {
  path: '/api/credit-cards/$id',
  methods: {
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { deleteCreditCard } = await import('@/features/finance/api/credit-cards')
      await deleteCreditCard(session.user.id, params.id)
      return new Response(null, { status: 204 })
    },
  },
}

