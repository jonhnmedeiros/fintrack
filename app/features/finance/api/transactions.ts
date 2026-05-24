import { userDb } from '@/lib/tenant-db'
import { createTransactionSchema } from '../schemas'
import { prisma } from '@/lib/db'

export async function listTransactions(filters?: {
  type?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}) {
  const db = await userDb()
  const where: Record<string, unknown> = {}
  if (filters?.type) where.type = filters.type
  if (filters?.categoryId) where.categoryId = filters.categoryId
  if (filters?.startDate || filters?.endDate) {
    ;(where.date as Record<string, unknown>) = {}
    if (filters.startDate) (where.date as Record<string, unknown>).gte = new Date(filters.startDate)
    if (filters.endDate) (where.date as Record<string, unknown>).lte = new Date(filters.endDate)
  }
  return db.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: true },
  })
}

export async function createTransaction(data: unknown) {
  const validated = createTransactionSchema.parse(data)
  const db = await userDb()

  if (validated.creditCardId && validated.totalInstallments && validated.totalInstallments > 1) {
    const installmentAmount = validated.amount / validated.totalInstallments
    const transactions = []
    for (let i = 1; i <= validated.totalInstallments; i++) {
      const installmentDate = new Date(validated.date)
      installmentDate.setMonth(installmentDate.getMonth() + i - 1)
      transactions.push(
        db.transaction.create({
          data: {
            ...validated,
            amount: installmentAmount,
            installmentNumber: i,
            date: installmentDate.toISOString(),
          },
        })
      )
    }
    return prisma.$transaction(transactions)
  }

  return db.transaction.create({ data: validated })
}

export async function deleteTransaction(id: string) {
  const db = await userDb()
  return db.transaction.delete({ where: { id } })
}
