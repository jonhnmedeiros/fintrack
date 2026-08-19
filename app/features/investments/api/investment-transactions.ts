import { userDb } from '@/lib/tenant-db'
import { prisma } from '@/lib/db'
import { createInvestmentTransactionSchema } from '../schemas'

const TX_TYPE_LABEL: Record<string, string> = {
  BUY: 'Aporte',
  SELL: 'Resgate',
  DIVIDEND: 'Dividendo',
  TAX: 'Taxa',
}

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
  // Data-only (yyyy-MM-dd) ancorada em UTC — mesmo motivo do fix em
  // finance/api/transactions.ts: string sem timezone quebra o Prisma
  // ("premature end of input, Expected ISO-8601 DateTime") e, se aceita
  // de outra forma, ficaria sujeita ao timezone do processo do servidor.
  const date = new Date(validated.date + 'T00:00:00Z')
  const { walletId, ...invData } = validated

  // Bonificação não movimenta dinheiro — nunca gera lançamento na conta,
  // mesmo que uma conta tenha sido selecionada no formulário.
  if (!walletId || validated.type === 'BONUS') {
    return db.investmentTransaction.create({ data: { ...invData, date } })
  }

  const amount = Number(validated.quantity) * Number(validated.price)
  const fees = Number(validated.fees || 0)
  const taxes = Number(validated.taxes || 0)
  const isDebit = validated.type === 'BUY' || validated.type === 'TAX'
  const total = Math.max(0.01, isDebit ? amount + fees + taxes : amount - fees - taxes)

  const [asset, user] = await Promise.all([
    prisma.asset.findUnique({ where: { id: validated.assetId }, select: { ticker: true, type: true } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { investExpenseCategoryId: true, investIncomeCategoryId: true },
    }),
  ])
  const isCdb = asset?.type === 'CDB'
  const label = isCdb
    ? (validated.type === 'BUY' ? 'Aporte' : validated.type === 'SELL' ? 'Resgate' : TX_TYPE_LABEL[validated.type])
    : (validated.type === 'BUY' ? 'Compra' : validated.type === 'SELL' ? 'Venda' : TX_TYPE_LABEL[validated.type])
  const description = `${label || validated.type}${asset ? ` — ${asset.ticker}` : ''}`
  // Categoria padrão configurada em Configurações > Investimentos, se houver.
  const categoryId = isDebit ? user?.investExpenseCategoryId : user?.investIncomeCategoryId

  return prisma.$transaction(async (tx) => {
    const walletTx = await tx.transaction.create({
      data: {
        type: isDebit ? 'EXPENSE' : 'INCOME',
        amount: total,
        description,
        date,
        walletId,
        categoryId: categoryId || undefined,
        userId,
      },
    })
    return tx.investmentTransaction.create({
      data: { ...invData, date, userId, linkedTransactionId: walletTx.id },
    })
  })
}

export async function deleteInvestmentTransaction(userId: string, id: string) {
  const db = userDb(userId)
  const [invTx] = await db.investmentTransaction.findMany({
    where: { id },
    select: { linkedTransactionId: true },
  })

  if (invTx?.linkedTransactionId) {
    const linkedId = invTx.linkedTransactionId
    return prisma.$transaction([
      prisma.investmentTransaction.delete({ where: { id } }),
      prisma.transaction.delete({ where: { id: linkedId } }),
    ])
  }

  return db.investmentTransaction.delete({ where: { id } })
}
