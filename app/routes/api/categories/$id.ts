import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/categories/$id')({})

export const APIRoute = {
  path: '/api/categories/$id',
  methods: {
    PUT: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const body = await request.json()
      const { updateCategory } = await import('@/features/finance/api/categories')
      const category = await updateCategory(session.user.id, params.id, body)
      return Response.json(category)
    },
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { deleteCategory } = await import('@/features/finance/api/categories')
      await deleteCategory(session.user.id, params.id)
      return new Response(null, { status: 204 })
    },
  },
}

