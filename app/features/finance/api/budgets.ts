import { userDb } from '@/lib/tenant-db'
import { createBudgetSchema } from '../schemas'

export async function listBudgets(userId: string, year?: number, month?: number) {
  const db = userDb(userId)
  const where: Record<string, unknown> = {}
  if (year) where.year = year
  if (month) where.month = month
  return db.budget.findMany({ where, include: { category: true } })
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
