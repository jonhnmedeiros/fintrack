import { userDb } from '@/lib/tenant-db'
import { createTransactionSchema, updateTransactionSchema } from '../schemas'
import { prisma } from '@/lib/db'

export async function listTransactions(
  userId: string,
  filters?: {
    type?: string
    categoryId?: string
    walletId?: string
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
  if (filters?.walletId) {
    where.OR = [{ walletId: filters.walletId }, { toWalletId: filters.walletId }]
  }
  if (filters?.startDate || filters?.endDate) {
    ;(where.date as Record<string, unknown>) = {}
    if (filters.startDate) (where.date as Record<string, unknown>).gte = new Date(filters.startDate + 'T00:00:00Z')
    if (filters.endDate) (where.date as Record<string, unknown>).lte = new Date(filters.endDate + 'T23:59:59Z')
  }
  return db.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    // _count.paidTransactions > 0 identifica um pagamento de fatura de
    // cartão (quita outras transações) — usado pelo Dashboard pra não
    // contar a mesma despesa duas vezes (na compra e no pagamento).
    include: { category: true, wallet: true, toWallet: true, _count: { select: { paidTransactions: true } } },
  })
}

export async function createTransaction(userId: string, data: unknown) {
  const validated = createTransactionSchema.parse(data)
  const db = userDb(userId)

  // Data-only (yyyy-MM-dd) sempre ancorada em UTC: evita que o timezone do
  // servidor (local no dev, UTC em produção/Vercel) desloque o dia salvo.
  const baseDate = new Date(validated.date + 'T00:00:00Z')

  if (validated.creditCardId) {
    const card = await prisma.creditCard.findUnique({
      where: { id: validated.creditCardId },
      select: { closingDay: true },
    })
    // Compra feita no dia do fechamento ou depois: o ciclo atual já fechou,
    // então ela (e cada parcela seguinte) cai na fatura do mês seguinte —
    // `date` passa a representar o mês da fatura, não o dia exato da compra.
    if (card?.closingDay && baseDate.getUTCDate() >= card.closingDay) {
      baseDate.setUTCMonth(baseDate.getUTCMonth() + 1)
    }
  }

  const txData = { ...validated, date: baseDate }

  if (txData.creditCardId && txData.totalInstallments && txData.totalInstallments > 1) {
    const installmentAmount = txData.amount / txData.totalInstallments
    const transactions = []
    for (let i = 1; i <= txData.totalInstallments; i++) {
      const installmentDate = new Date(txData.date)
      // setUTCMonth (não setMonth) para não depender do timezone local do processo
      installmentDate.setUTCMonth(installmentDate.getUTCMonth() + i - 1)
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
      date: new Date(validated.date + 'T00:00:00Z'),
    },
  })
}
