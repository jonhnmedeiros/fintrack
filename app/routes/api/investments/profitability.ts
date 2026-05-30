import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/investments/profitability')({})

export const APIRoute = {
  path: '/api/investments/profitability',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)

      const { prisma } = await import('@/lib/db')

      const assets = await prisma.asset.findMany({
        where: { userId: effectiveUserId },
        include: {
          transactions: { orderBy: { date: 'asc' } },
        },
      })

      const allTxs = assets.flatMap((a) =>
        a.transactions.map((tx) => ({
          date: tx.date.toISOString().split('T')[0],
          type: tx.type as string,
          quantity: Number(tx.quantity),
          price: Number(tx.price),
          ticker: a.ticker,
        }))
      )

      if (allTxs.length === 0) {
        return Response.json({ data: [] })
      }

      allTxs.sort((a, b) => a.date.localeCompare(b.date))

      const months = [...new Set(allTxs.map((t) => t.date.slice(0, 7)))].sort()

      const positions: Record<string, { qty: number; totalCost: number }> = {}
      const data: { month: string; cost: number; marketValue: number; profit: number }[] = []

      for (const asset of assets) {
        positions[asset.ticker] = { qty: 0, totalCost: 0 }
      }

      let txIndex = 0
      for (const month of months) {
        while (txIndex < allTxs.length && allTxs[txIndex].date.startsWith(month)) {
          const tx = allTxs[txIndex]
          const pos = positions[tx.ticker]
          if (!pos) continue

          if (tx.type === 'BUY') {
            pos.qty += tx.quantity
            pos.totalCost += tx.quantity * tx.price
          } else if (tx.type === 'SELL') {
            if (pos.qty > 0) {
              const avgCost = pos.totalCost / pos.qty
              pos.qty -= tx.quantity
              pos.totalCost = Math.max(0, pos.totalCost - tx.quantity * avgCost)
            }
          }
          txIndex++
        }

        let totalCost = 0
        let totalMktValue = 0

        for (const asset of assets) {
          const pos = positions[asset.ticker]
          if (!pos || pos.qty <= 0) continue

          const lastTx = asset.transactions
            .filter((t) => {
              const d = t.date instanceof Date ? t.date : new Date(t.date)
              return d <= new Date(month + '-28')
            })
            .pop()

          const currentPrice = lastTx ? Number(lastTx.price) : pos.totalCost / pos.qty
          totalCost += pos.totalCost
          totalMktValue += pos.qty * currentPrice
        }

        data.push({
          month,
          cost: Math.round(totalCost * 100) / 100,
          marketValue: Math.round(totalMktValue * 100) / 100,
          profit: Math.round((totalMktValue - totalCost) * 100) / 100,
        })
      }

      return Response.json({ data })
    },
  },
}
