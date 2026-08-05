import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/wallets/')({})

export const APIRoute = {
  path: '/api/wallets/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { listWallets } = await import('@/features/finance/api/wallets')
      const wallets = await listWallets(effectiveUserId)
      return Response.json(wallets)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const body = await request.json()
      const { createWallet } = await import('@/features/finance/api/wallets')
      try {
        const wallet = await createWallet(session.user.id, body)
        return Response.json(wallet)
      } catch (err: any) {
        if (err?.code === 'P2002') {
          return Response.json({ error: 'Já existe uma conta com este nome' }, { status: 409 })
        }
        if (err?.issues) {
          return Response.json({ error: err.issues.map((i: any) => i.message).join(', ') }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao criar conta' }, { status: 500 })
      }
    },
  },
}
