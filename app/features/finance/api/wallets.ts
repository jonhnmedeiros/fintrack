import { userDb } from '@/lib/tenant-db'
import { prisma } from '@/lib/db'
import { createWalletSchema } from '../schemas'

export async function listWallets(userId: string) {
  const db = userDb(userId)
  const wallets = await db.wallet.findMany({ orderBy: { name: 'asc' } })

  const [incoming, outgoing] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['toWalletId'],
      where: { userId, toWalletId: { not: null } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['walletId', 'type'],
      where: { userId, walletId: { not: null } },
      _sum: { amount: true },
    }),
  ])

  const incomingByWallet = new Map(incoming.map((i) => [i.toWalletId, Number(i._sum.amount ?? 0)]))

  return wallets.map((w) => {
    let balance = incomingByWallet.get(w.id) ?? 0
    for (const row of outgoing) {
      if (row.walletId !== w.id) continue
      const amount = Number(row._sum.amount ?? 0)
      if (row.type === 'INCOME') balance += amount
      else if (row.type === 'EXPENSE') balance -= amount
      else if (row.type === 'TRANSFER') balance -= amount
    }
    return { ...w, balance }
  })
}

export async function createWallet(userId: string, data: unknown) {
  const validated = createWalletSchema.parse(data)
  const db = userDb(userId)
  return db.wallet.create({ data: validated })
}

export async function updateWallet(userId: string, id: string, data: unknown) {
  const validated = createWalletSchema.partial().parse(data)
  const db = userDb(userId)
  return db.wallet.update({ where: { id }, data: validated })
}

export async function deleteWallet(userId: string, id: string) {
  const db = userDb(userId)
  const linked = await prisma.transaction.count({
    where: { userId, OR: [{ walletId: id }, { toWalletId: id }] },
  })
  if (linked > 0) {
    const err = new Error('Conta possui transações vinculadas') as Error & { code: string }
    err.code = 'P2003'
    throw err
  }
  return db.wallet.delete({ where: { id } })
}
