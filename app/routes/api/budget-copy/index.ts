import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/budget-copy/')({})

export const APIRoute = {
  path: '/api/budget-copy/',
  methods: {
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { copyBudgets } = await import('@/features/finance/api/budgets')
      try {
        const body = await request.json()
        const { fromMonth, fromYear, toMonth, toYear } = body as {
          fromMonth: number
          fromYear: number
          toMonth: number
          toYear: number
        }
        if (!fromMonth || !fromYear || !toMonth || !toYear) {
          return Response.json({ error: 'Período inválido' }, { status: 400 })
        }
        const result = await copyBudgets(
          session.user.id,
          { month: fromMonth, year: fromYear },
          { month: toMonth, year: toYear }
        )
        return Response.json(result)
      } catch {
        return Response.json({ error: 'Erro ao copiar orçamentos' }, { status: 500 })
      }
    },
  },
}
