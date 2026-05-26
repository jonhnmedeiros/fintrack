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
  return db.investmentTransaction.create({ data: validated })
}

export async function deleteInvestmentTransaction(userId: string, id: string) {
  const db = userDb(userId)
  return db.investmentTransaction.delete({ where: { id } })
}
