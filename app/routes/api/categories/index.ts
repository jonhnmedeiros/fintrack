import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/categories/')({})

export const APIRoute = {
  path: '/api/categories/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { listCategories } = await import('@/features/finance/api/categories')
      const categories = await listCategories(effectiveUserId)
      return Response.json(categories)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const body = await request.json()
      const { createCategory } = await import('@/features/finance/api/categories')
      try {
        const category = await createCategory(session.user.id, body)
        return Response.json(category)
      } catch (err: any) {
        if (err?.code === 'P2002') {
          return Response.json({ error: 'Já existe uma categoria com este nome' }, { status: 409 })
        }
        const message = err?.issues ? err.issues.map((i: any) => i.message).join(', ') : err?.message || 'Erro ao criar categoria'
        return Response.json({ error: message }, { status: 500 })
      }
    },
  },
}
