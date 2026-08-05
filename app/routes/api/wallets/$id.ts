import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/wallets/$id')({})

export const APIRoute = {
  path: '/api/wallets/$id',
  methods: {
    PUT: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const body = await request.json()
      const { updateWallet } = await import('@/features/finance/api/wallets')
      try {
        const wallet = await updateWallet(session.user.id, params.id, body)
        return Response.json(wallet)
      } catch (err: any) {
        if (err?.code === 'P2002') {
          return Response.json({ error: 'Já existe uma conta com este nome' }, { status: 409 })
        }
        if (err?.code === 'P2025') {
          return Response.json({ error: 'Conta não encontrada' }, { status: 404 })
        }
        return Response.json({ error: 'Erro ao atualizar conta' }, { status: 500 })
      }
    },
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { deleteWallet } = await import('@/features/finance/api/wallets')
      try {
        await deleteWallet(session.user.id, params.id)
        return new Response(null, { status: 204 })
      } catch (err: any) {
        if (err?.code === 'P2003') {
          return Response.json({ error: 'Conta possui transações vinculadas' }, { status: 409 })
        }
        if (err?.code === 'P2025') {
          return Response.json({ error: 'Conta não encontrada' }, { status: 404 })
        }
        return Response.json({ error: 'Erro ao excluir conta' }, { status: 500 })
      }
    },
  },
}
