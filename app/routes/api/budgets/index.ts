import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/budgets/')({})

export const APIRoute = {
  path: '/api/budgets/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { listBudgets } = await import('@/features/finance/api/budgets')
      const url = new URL(request.url)
      const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined
      const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined
      const budgets = await listBudgets(effectiveUserId, year, month)
      return Response.json(budgets)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { createOrUpdateBudget } = await import('@/features/finance/api/budgets')
      try {
        const body = await request.json()
        const budget = await createOrUpdateBudget(session.user.id, body)
        return Response.json(budget)
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2002') {
            return Response.json({ error: 'Já existe um orçamento para esta categoria neste período' }, { status: 409 })
          }
        }
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao salvar orçamento' }, { status: 500 })
      }
    },
  },
}

