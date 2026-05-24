import { userDb } from '@/lib/tenant-db'
import { createInvestmentTransactionSchema } from '../schemas'

export async function listInvestmentTransactions(assetId?: string) {
  const db = await userDb()
  const where: Record<string, unknown> = {}
  if (assetId) where.assetId = assetId
  return db.investmentTransaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { asset: true },
  })
}

export async function createInvestmentTransaction(data: unknown) {
  const validated = createInvestmentTransactionSchema.parse(data)
  const db = await userDb()
  return db.investmentTransaction.create({ data: validated })
}

export async function deleteInvestmentTransaction(id: string) {
  const db = await userDb()
  return db.investmentTransaction.delete({ where: { id } })
}
