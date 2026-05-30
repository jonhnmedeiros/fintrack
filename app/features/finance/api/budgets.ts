import { userDb } from '@/lib/tenant-db'
import { prisma } from '@/lib/db'
import { createBudgetSchema } from '../schemas'

export async function listBudgets(userId: string, year?: number, month?: number) {
  const db = userDb(userId)
  const where: Record<string, unknown> = {}
  if (year) where.year = year
  if (month) where.month = month
  const budgets = await db.budget.findMany({ where, include: { category: true } })

  if (year && month) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)
    const aggregates = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lt: endDate },
        categoryId: { in: budgets.map((b: { categoryId: string }) => b.categoryId) },
      },
      _sum: { amount: true },
    })
    const spentMap: Record<string, number> = {}
    for (const a of aggregates) {
      const catId = a.categoryId
      if (catId && a._sum.amount) {
        spentMap[catId] = Number(a._sum.amount)
      }
    }
    return budgets.map((b: Record<string, unknown>) => ({ ...b, amount: Number(b.amount), spent: spentMap[b.categoryId as string] || 0 }))
  }

  return budgets.map((b: Record<string, unknown>) => ({ ...b, amount: Number(b.amount), spent: 0 }))
}

export async function createOrUpdateBudget(userId: string, data: unknown) {
  const validated = createBudgetSchema.parse(data)
  const db = userDb(userId)
  return db.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: validated.categoryId,
        month: validated.month,
        year: validated.year,
      },
    },
    create: { ...validated, userId },
    update: { amount: validated.amount },
  })
}

export async function deleteBudget(userId: string, id: string) {
  const db = userDb(userId)
  return db.budget.delete({ where: { id } })
}
