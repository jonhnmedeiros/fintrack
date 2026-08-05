import { userDb } from '@/lib/tenant-db'
import { createInvestmentTransactionSchema } from '../schemas'

export async function listInvestmentTransactions(userId: string, assetId?: string) {
  const db = userDb(userId)
  const where: Record<string, unknown> = {}
  if (assetId) where.assetId = assetId
  return db.investmentTransaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { asset: true },
  })
}

export async function createInvestmentTransaction(userId: string, data: unknown) {
  const validated = createInvestmentTransactionSchema.parse(data)
  const db = userDb(userId)
  // Data-only (yyyy-MM-dd) ancorada em UTC — mesmo motivo do fix em
  // finance/api/transactions.ts: string sem timezone quebra o Prisma
  // ("premature end of input, Expected ISO-8601 DateTime") e, se aceita
  // de outra forma, ficaria sujeita ao timezone do processo do servidor.
  return db.investmentTransaction.create({
    data: { ...validated, date: new Date(validated.date + 'T00:00:00Z') },
  })
}

export async function deleteInvestmentTransaction(userId: string, id: string) {
  const db = userDb(userId)
  return db.investmentTransaction.delete({ where: { id } })
}
