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

    // Orçamento numa categoria-pai deve contabilizar também os gastos
    // lançados nas subcategorias dela (ex: orçamento em "Alimentação" soma
    // gastos em "Restaurante", "Supermercado" etc, se forem filhas).
    const allCategories = await db.category.findMany({ select: { id: true, parentId: true } })
    const childrenByParent: Record<string, string[]> = {}
    for (const c of allCategories as { id: string; parentId: string | null }[]) {
      if (c.parentId) {
        if (!childrenByParent[c.parentId]) childrenByParent[c.parentId] = []
        childrenByParent[c.parentId].push(c.id)
      }
    }

    const categoryIdsToSum = [
      ...new Set(
        budgets.flatMap((b: { categoryId: string }) => [b.categoryId, ...(childrenByParent[b.categoryId] || [])])
      ),
    ]

    const aggregates = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lt: endDate },
        categoryId: { in: categoryIdsToSum },
      },
      _sum: { amount: true },
    })
    const spentByCategory: Record<string, number> = {}
    for (const a of aggregates) {
      const catId = a.categoryId
      if (catId && a._sum.amount) {
        spentByCategory[catId] = Number(a._sum.amount)
      }
    }
    return budgets.map((b: Record<string, unknown>) => {
      const categoryId = b.categoryId as string
      const ids = [categoryId, ...(childrenByParent[categoryId] || [])]
      const spent = ids.reduce((sum, id) => sum + (spentByCategory[id] || 0), 0)
      return { ...b, amount: Number(b.amount), spent }
    })
  }

  return budgets.map((b: Record<string, unknown>) => ({ ...b, amount: Number(b.amount), spent: 0 }))
}

export async function copyBudgets(
  userId: string,
  from: { month: number; year: number },
  to: { month: number; year: number }
) {
  const db = userDb(userId)
  const sourceBudgets = await db.budget.findMany({ where: { month: from.month, year: from.year } })
  if (sourceBudgets.length === 0) return { copied: 0 }

  const existing = await db.budget.findMany({
    where: { month: to.month, year: to.year },
    select: { categoryId: true },
  })
  const existingCategoryIds = new Set((existing as { categoryId: string }[]).map((b) => b.categoryId))

  const toCreate = (sourceBudgets as unknown as { categoryId: string; amount: number | string }[]).filter(
    (b) => !existingCategoryIds.has(b.categoryId)
  )
  if (toCreate.length === 0) return { copied: 0 }

  await Promise.all(
    toCreate.map((b) =>
      db.budget.create({
        data: { categoryId: b.categoryId, amount: b.amount, month: to.month, year: to.year, userId },
      })
    )
  )
  return { copied: toCreate.length }
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
