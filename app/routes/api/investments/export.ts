import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/investments/export')({})

export const APIRoute = {
  path: '/api/investments/export',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)

      const url = new URL(request.url)
      const format = url.searchParams.get('format') || 'csv'

      const { prisma } = await import('@/lib/db')

      const assets = await prisma.asset.findMany({
        where: { userId: effectiveUserId },
        include: {
          transactions: { orderBy: { date: 'desc' } },
        },
        orderBy: { ticker: 'asc' },
      })

      if (format === 'json') {
        const json = assets.map((a) => ({
          ticker: a.ticker,
          name: a.name,
          type: a.type,
          market: a.market,
          transactions: a.transactions.map((t) => ({
            date: t.date.toISOString().split('T')[0],
            type: t.type,
            quantity: Number(t.quantity),
            price: Number(t.price),
            fees: Number(t.fees),
            taxes: Number(t.taxes),
          })),
        }))

        return new Response(JSON.stringify(json, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="carteira.json"',
          },
        })
      }

      const header = 'ticker,nome,tipo,mercado,data,operacao,quantidade,preco,taxas'
      const rows = assets.flatMap((a) => {
        if (a.transactions.length === 0) {
          return [`${a.ticker},${a.name || ''},${a.type},${a.market || ''},,,,`]
        }
        return a.transactions.map((t) =>
          [
            a.ticker,
            a.name || '',
            a.type,
            a.market || '',
            t.date.toISOString().split('T')[0],
            t.type,
            Number(t.quantity),
            Number(t.price),
            Number(t.fees) + Number(t.taxes),
          ].join(',')
        )
      })

      const csv = [header, ...rows].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="carteira.csv"',
        },
      })
    },
  },
}
