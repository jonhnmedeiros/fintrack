import { userDb } from '@/lib/tenant-db'
import { createTransactionSchema, updateTransactionSchema } from '../schemas'
import { prisma } from '@/lib/db'

export async function listTransactions(
  userId: string,
  filters?: {
    type?: string
    categoryId?: string
    startDate?: string
    endDate?: string
  }
) {
  const db = userDb(userId)
  const where: Record<string, unknown> = {}
  if (filters?.type) where.type = filters.type
  if (filters?.categoryId) {
    where.category = {
      OR: [
        { id: filters.categoryId },
        { parentId: filters.categoryId },
      ],
    }
  }
  if (filters?.startDate || filters?.endDate) {
    ;(where.date as Record<string, unknown>) = {}
    if (filters.startDate) (where.date as Record<string, unknown>).gte = new Date(filters.startDate + 'T00:00:00')
    if (filters.endDate) (where.date as Record<string, unknown>).lte = new Date(filters.endDate + 'T23:59:59')
  }
  return db.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: true },
  })
}

export async function createTransaction(userId: string, data: unknown) {
  const validated = createTransactionSchema.parse(data)
  const db = userDb(userId)

  const txData = {
    ...validated,
    date: new Date(validated.date + 'T00:00:00'),
  }

  if (txData.creditCardId && txData.totalInstallments && txData.totalInstallments > 1) {
    const installmentAmount = txData.amount / txData.totalInstallments
    const transactions = []
    for (let i = 1; i <= txData.totalInstallments; i++) {
      const installmentDate = new Date(txData.date)
      installmentDate.setMonth(installmentDate.getMonth() + i - 1)
      transactions.push(
        db.transaction.create({
          data: {
            ...txData,
            amount: installmentAmount,
            installmentNumber: i,
            date: installmentDate,
          },
        })
      )
    }
    return prisma.$transaction(transactions)
  }

  return db.transaction.create({ data: txData })
}

export async function deleteTransaction(userId: string, id: string) {
  const db = userDb(userId)
  return db.transaction.delete({ where: { id } })
}

export async function updateTransaction(userId: string, id: string, data: unknown) {
  const validated = updateTransactionSchema.parse(data)
  const db = userDb(userId)
  return db.transaction.update({
    where: { id },
    data: {
      ...validated,
      date: new Date(validated.date + 'T00:00:00'),
    },
  })
}
