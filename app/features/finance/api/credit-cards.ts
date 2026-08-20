import { userDb } from '@/lib/tenant-db'
import { prisma } from '@/lib/db'
import { createCreditCardSchema } from '../schemas'

export async function listCreditCards(userId: string) {
  const db = userDb(userId)
  const cards = await db.creditCard.findMany({ orderBy: { name: 'asc' } })

  // Limite disponível = limite - soma das compras ainda não pagas (fatura
  // aberta + faturas fechadas em aberto), independente do mês. Exclui os
  // próprios pagamentos de fatura (paidTransactions não-vazio) do total.
  const openTotals = await prisma.transaction.groupBy({
    by: ['creditCardId'],
    where: {
      userId,
      creditCardId: { in: cards.map((c) => c.id) },
      invoicePaymentId: null,
      type: 'EXPENSE',
      paidTransactions: { none: {} },
    },
    _sum: { amount: true },
  })
  const openByCard = new Map(openTotals.map((t) => [t.creditCardId, Number(t._sum.amount ?? 0)]))

  return cards.map((c) => {
    const used = openByCard.get(c.id) ?? 0
    return { ...c, used, available: c.limit != null ? Number(c.limit) - used : null }
  })
}

export async function createCreditCard(userId: string, data: unknown) {
  const validated = createCreditCardSchema.parse(data)
  const db = userDb(userId)
  return db.creditCard.create({ data: validated })
}

export async function deleteCreditCard(userId: string, id: string) {
  const db = userDb(userId)
  return db.creditCard.delete({ where: { id } })
}

interface InvoiceTx {
  id: string
  amount: unknown
  description: string | null
  date: Date
  installmentNumber: number | null
  totalInstallments: number | null
  invoicePaymentId: string | null
}

/**
 * Agrupa as compras do cartão por mês/ano de `date` — que, desde a criação
 * da transação (ver finance/api/transactions.ts), já representa o mês da
 * fatura (compra após o fechamento é empurrada pro mês seguinte), não
 * necessariamente o dia exato da compra.
 */
export async function listInvoices(userId: string, cardId: string) {
  const card = await prisma.creditCard.findFirst({ where: { id: cardId, userId } })
  if (!card) {
    const err = new Error('Cartão não encontrado') as Error & { code: string }
    err.code = 'P2025'
    throw err
  }

  // "Compra" = qualquer transação do cartão que NÃO seja, ela mesma, um
  // pagamento de fatura (paidTransactions vazio) — não filtramos por
  // walletId aqui porque compras lançadas antes desta funcionalidade ainda
  // têm walletId preenchido (regra antiga), e não podem sumir da listagem.
  const transactions = (await prisma.transaction.findMany({
    where: { userId, creditCardId: cardId, type: 'EXPENSE', paidTransactions: { none: {} } },
    orderBy: { date: 'asc' },
  })) as unknown as InvoiceTx[]

  const buckets = new Map<string, InvoiceTx[]>()
  for (const t of transactions) {
    const key = `${t.date.getUTCFullYear()}-${String(t.date.getUTCMonth() + 1).padStart(2, '0')}`
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(t)
  }

  const now = new Date()
  const invoices = [...buckets.entries()]
    .map(([key, txs]) => {
      const [year, month] = key.split('-').map(Number)
      const total = txs.reduce((sum, t) => sum + Number(t.amount), 0)
      const allPaid = txs.every((t) => !!t.invoicePaymentId)
      let status: 'aberta' | 'fechada' | 'paga'
      if (allPaid) {
        status = 'paga'
      } else if (card.closingDay) {
        const closingDate = new Date(Date.UTC(year, month - 1, card.closingDay))
        status = now >= closingDate ? 'fechada' : 'aberta'
      } else {
        status = 'fechada'
      }
      return {
        month,
        year,
        total: Math.round(total * 100) / 100,
        status,
        transactions: txs.map((t) => ({ ...t, amount: Number(t.amount) })),
      }
    })
    .sort((a, b) => (a.year - b.year) || (a.month - b.month))

  return { card, invoices }
}

export async function payInvoice(
  userId: string,
  cardId: string,
  data: { month: number; year: number; walletId: string; date: string; categoryId?: string }
) {
  const card = await prisma.creditCard.findFirst({ where: { id: cardId, userId } })
  if (!card) {
    const err = new Error('Cartão não encontrado') as Error & { code: string }
    err.code = 'P2025'
    throw err
  }

  const startDate = new Date(Date.UTC(data.year, data.month - 1, 1))
  const endDate = new Date(Date.UTC(data.year, data.month, 1))

  const unpaid = await prisma.transaction.findMany({
    where: {
      userId,
      creditCardId: cardId,
      type: 'EXPENSE',
      invoicePaymentId: null,
      paidTransactions: { none: {} },
      date: { gte: startDate, lt: endDate },
    },
  })

  if (unpaid.length === 0) {
    throw new Error('Nenhuma transação em aberto nesta fatura')
  }

  const total = unpaid.reduce((sum, t) => sum + Number(t.amount), 0)
  const monthLabel = String(data.month).padStart(2, '0')

  return prisma.$transaction(async (tx) => {
    const payment = await tx.transaction.create({
      data: {
        type: 'EXPENSE',
        amount: Math.round(total * 100) / 100,
        description: `Fatura ${card.name} ${monthLabel}/${data.year}`,
        date: new Date(data.date + 'T00:00:00Z'),
        walletId: data.walletId,
        creditCardId: cardId,
        categoryId: data.categoryId || undefined,
        userId,
      },
    })
    await tx.transaction.updateMany({
      where: { id: { in: unpaid.map((t) => t.id) } },
      data: { invoicePaymentId: payment.id },
    })
    return { payment, paidCount: unpaid.length, total }
  })
}
