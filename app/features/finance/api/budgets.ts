import { userDb } from '@/lib/tenant-db'
import { createBudgetSchema } from '../schemas'

export async function listBudgets(year?: number, month?: number) {
  const db = await userDb()
  const where: Record<string, unknown> = {}
  if (year) where.year = year
  if (month) where.month = month
  return db.budget.findMany({ where, include: { category: true } })
}

export async function createOrUpdateBudget(data: unknown) {
  const validated = createBudgetSchema.parse(data)
  const db = await userDb()
  return db.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: validated.userId,
        categoryId: validated.categoryId,
        month: validated.month,
        year: validated.year,
      },
    },
    create: validated,
    update: { amount: validated.amount },
  })
}

export async function deleteBudget(id: string) {
  const db = await userDb()
  return db.budget.delete({ where: { id } })
}
