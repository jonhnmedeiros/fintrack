import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/categories/')({})

export const APIRoute = {
  path: '/api/categories/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { listCategories } = await import('@/features/finance/api/categories')
      const categories = await listCategories(session.user.id)
      return Response.json(categories)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const body = await request.json()
      const { createCategory } = await import('@/features/finance/api/categories')
      const category = await createCategory(session.user.id, body)
      return Response.json(category)
    },
  },
}

