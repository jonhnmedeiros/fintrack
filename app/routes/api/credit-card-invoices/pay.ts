import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/credit-card-invoices/pay')({})

export const APIRoute = {
  path: '/api/credit-card-invoices/pay',
  methods: {
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { payInvoice } = await import('@/features/finance/api/credit-cards')
      try {
        const body = await request.json()
        const { cardId, month, year, walletId, date, categoryId } = body as {
          cardId: string
          month: number
          year: number
          walletId: string
          date: string
          categoryId?: string
        }
        if (!cardId || !month || !year || !walletId || !date) {
          return Response.json({ error: 'Dados incompletos' }, { status: 400 })
        }
        const result = await payInvoice(session.user.id, cardId, { month, year, walletId, date, categoryId })
        return Response.json(result)
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2025') {
          return Response.json({ error: 'Cartão não encontrado' }, { status: 404 })
        }
        return Response.json(
          { error: err instanceof Error ? err.message : 'Erro ao pagar fatura' },
          { status: 400 }
        )
      }
    },
  },
}
