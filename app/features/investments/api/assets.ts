import { userDb } from '@/lib/tenant-db'
import { createAssetSchema } from '../schemas'

export async function listAssets() {
  const db = await userDb()
  return db.asset.findMany({
    orderBy: { ticker: 'asc' },
    include: {
      transactions: { orderBy: { date: 'desc' } },
      alerts: { where: { active: true } },
    },
  })
}

export async function createAsset(data: unknown) {
  const validated = createAssetSchema.parse(data)
  const db = await userDb()
  return db.asset.create({ data: validated })
}

export async function deleteAsset(id: string) {
  const db = await userDb()
  return db.asset.delete({ where: { id } })
}

export function calcAveragePrice(transactions: { type: string; quantity: number; price: number }[]) {
  let totalQuantity = 0
  let totalCost = 0

  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      totalQuantity += tx.quantity
      totalCost += tx.quantity * tx.price
    } else if (tx.type === 'SELL') {
      totalQuantity -= tx.quantity
      const avgCost = totalQuantity > 0 ? totalCost / (totalQuantity + tx.quantity) : 0
      totalCost -= tx.quantity * avgCost
    }
  }

  return totalQuantity > 0 ? totalCost / totalQuantity : 0
}

export function calcPL(
  transactions: { type: string; quantity: number; price: number }[],
  currentPrice: number
) {
  const avgPrice = calcAveragePrice(transactions)
  const buyQty = transactions
    .filter((t) => t.type === 'BUY')
    .reduce((sum, t) => sum + t.quantity, 0)
  const sellQty = transactions
    .filter((t) => t.type === 'SELL')
    .reduce((sum, t) => sum + t.quantity, 0)
  const totalQuantity = buyQty - sellQty
  const invested = totalQuantity * avgPrice
  const current = totalQuantity * currentPrice
  const profit = current - invested
  const percent = invested > 0 ? (profit / invested) * 100 : 0

  return { avgPrice, totalQuantity, invested, current, profit, percent }
}
