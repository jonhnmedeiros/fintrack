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

      const isCdb = new Map(assets.map((a) => [a.ticker, a.type === 'CDB']))
      const positions: Record<string, { qty: number; totalCost: number }> = {}
      const firstBuyDate: Record<string, Date> = {}
      const data: { month: string; cost: number; marketValue: number; profit: number }[] = []

      for (const asset of assets) {
        positions[asset.ticker] = { qty: 0, totalCost: 0 }
      }

      // Taxas de referência (CDI/IPCA) só são buscadas se houver algum CDB na carteira.
      let rates: Awaited<ReturnType<typeof import('@/lib/rates').getReferenceRates>> | null = null
      const { getReferenceRates, calcFixedIncomeValue } = await import('@/lib/rates')
      if (assets.some((a) => a.type === 'CDB')) {
        try {
          rates = await getReferenceRates()
        } catch (err) {
          console.error('[profitability] falha ao buscar taxas de referência (CDI/IPCA):', err)
        }
      }

      let txIndex = 0
      for (const month of months) {
        while (txIndex < allTxs.length && allTxs[txIndex].date.startsWith(month)) {
          const tx = allTxs[txIndex]
          const pos = positions[tx.ticker]
          if (!pos) { txIndex++; continue }

          if (isCdb.get(tx.ticker)) {
            // CDB: quantity é sempre 1 (aporte/resgate) — o "preço" é o valor
            // em reais movimentado, não um preço por unidade. Tratamos como
            // fluxo de caixa simples (igual ao cálculo de principal em assets.ts),
            // não como diluição de preço médio por cota.
            if (tx.type === 'BUY') {
              if (!firstBuyDate[tx.ticker]) firstBuyDate[tx.ticker] = new Date(tx.date + 'T00:00:00Z')
              pos.qty += tx.quantity
              pos.totalCost += tx.quantity * tx.price
            } else if (tx.type === 'SELL') {
              pos.totalCost = Math.max(0, pos.totalCost - tx.quantity * tx.price)
              pos.qty = Math.max(0, pos.qty - tx.quantity)
            }
          } else if (tx.type === 'BUY' || tx.type === 'BONUS') {
            pos.qty += tx.quantity
            // Bonificação (ações recebidas sem custo) não altera o total investido.
            if (tx.type === 'BUY') pos.totalCost += tx.quantity * tx.price
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

          totalCost += pos.totalCost

          if (isCdb.get(asset.ticker)) {
            // Valor de mercado do CDB: estimado por juros compostos a partir da
            // taxa contratada, igual ao card do ativo (ver assets.ts) — não pelo
            // "preço" das transações, que aqui é apenas valor de aporte/resgate.
            const purchaseDate = firstBuyDate[asset.ticker]
            if (asset.rateType && asset.rate != null && rates && purchaseDate) {
              const referenceDate = new Date(`${month}-28T00:00:00Z`)
              totalMktValue += Math.max(
                pos.totalCost,
                calcFixedIncomeValue({
                  principal: pos.totalCost,
                  rateType: asset.rateType,
                  rate: Number(asset.rate),
                  purchaseDate,
                  referenceDate,
                  cdiAnnual: rates.cdiAnnual,
                  ipca12m: rates.ipca12m,
                })
              )
            } else {
              totalMktValue += pos.totalCost
            }
            continue
          }

          const lastTx = asset.transactions
            .filter((t) => {
              const d = t.date instanceof Date ? t.date : new Date(t.date)
              return d <= new Date(month + '-28')
            })
            .pop()

          const currentPrice = lastTx ? Number(lastTx.price) : pos.totalCost / pos.qty
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
