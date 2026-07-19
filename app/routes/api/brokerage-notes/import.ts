import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
export const Route = createFileRoute('/api/brokerage-notes/import')({})

const operationSchema = z.object({
  ticker: z.string().min(1).max(20).toUpperCase(),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  total: z.number(),
  assetType: z.enum(['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'OTHER']).optional(),
})

const importSchema = z.object({
  operations: z.array(operationSchema).min(1),
  date: z.string().optional(),
})

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
        let skipped = 0

        for (const op of validated.operations) {
          let asset = await prisma.asset.findFirst({
            where: { userId: session.user.id, ticker: op.ticker },
          })

          if (!asset) {
            asset = await db.asset.create({
              data: { ticker: op.ticker, type: op.assetType ?? 'OTHER', name: op.ticker },
            })
          }

          // Evita duplicar a mesma operação caso a nota seja importada mais de uma vez.
          const existing = await prisma.investmentTransaction.findFirst({
            where: {
              userId: session.user.id,
              assetId: asset.id,
              type: op.type,
              quantity: op.quantity,
              price: op.price,
              date: new Date(importDate),
            },
          })
          if (existing) {
            skipped++
            continue
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

        return Response.json({ created, skipped })
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao importar nota' }, { status: 500 })
      }
    },
  },
}
