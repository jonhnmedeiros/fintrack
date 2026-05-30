import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
export const Route = createFileRoute('/api/brokerage-notes/import')({})

const operationSchema = z.object({
  ticker: z.string().min(1).max(20).toUpperCase(),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  total: z.number(),
})

const importSchema = z.object({
  operations: z.array(operationSchema).min(1),
  date: z.string().optional(),
})

function guessAssetType(ticker: string): 'STOCK' | 'ETF' | 'CRYPTO' | 'FIIS' | 'BOND' | 'OTHER' {
  const upper = ticker.toUpperCase()
  if (/11$|12$/.test(upper)) return 'FIIS'
  if (/3[45]$|4[56]$/.test(upper)) return 'STOCK'
  if (/^BOVA|^IVVB|^ACWI/.test(upper)) return 'ETF'
  if (/^BTC|^ETH|^USDC/.test(upper)) return 'CRYPTO'
  if (/^NTN|^LTN|^LFT|^TESOURO/.test(upper)) return 'BOND'
  return 'OTHER'
}

export const APIRoute = {
  path: '/api/brokerage-notes/import',
  methods: {
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }

      try {
        const body = await request.json()
        const validated = importSchema.parse(body)
        const { prisma } = await import('@/lib/db')
        const { userDb } = await import('@/lib/tenant-db')
        const db = userDb(session.user.id)

        const importDate = validated.date || new Date().toISOString().split('T')[0]
        let created = 0

        for (const op of validated.operations) {
          let asset = await prisma.asset.findFirst({
            where: { userId: session.user.id, ticker: op.ticker },
          })

          if (!asset) {
            const type = guessAssetType(op.ticker)
            asset = await db.asset.create({
              data: { ticker: op.ticker, type, name: op.ticker },
            })
          }

          await db.investmentTransaction.create({
            data: {
              type: op.type,
              quantity: op.quantity,
              price: op.price,
              fees: 0,
              taxes: 0,
              date: importDate,
              assetId: asset.id,
            },
          })
          created++
        }

        return Response.json({ created })
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao importar nota' }, { status: 500 })
      }
    },
  },
}
