import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/alerts/$id')({})

export const APIRoute = {
  path: '/api/alerts/$id',
  methods: {
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { deleteAlert } = await import('@/features/investments/api/alerts')
      await deleteAlert(session.user.id, params.id)
      return new Response(null, { status: 204 })
    },
  },
}

