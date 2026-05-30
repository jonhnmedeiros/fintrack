import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/categories/$id')({})

export const APIRoute = {
  path: '/api/categories/$id',
  methods: {
    PUT: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const body = await request.json()
      const { updateCategory } = await import('@/features/finance/api/categories')
      try {
        const category = await updateCategory(session.user.id, params.id, body)
        return Response.json(category)
      } catch (err: any) {
        if (err?.code === 'P2002') {
          return Response.json({ error: 'Já existe uma categoria com este nome' }, { status: 409 })
        }
        if (err?.code === 'P2025') {
          return Response.json({ error: 'Categoria não encontrada' }, { status: 404 })
        }
        return Response.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
      }
    },
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { deleteCategory } = await import('@/features/finance/api/categories')
      try {
        await deleteCategory(session.user.id, params.id)
        return new Response(null, { status: 204 })
      } catch (err: any) {
        if (err?.code === 'P2003') {
          return Response.json({ error: 'Categoria possui vínculos com transações ou orçamentos' }, { status: 409 })
        }
        return Response.json({ error: 'Erro ao excluir categoria' }, { status: 500 })
      }
    },
  },
}
