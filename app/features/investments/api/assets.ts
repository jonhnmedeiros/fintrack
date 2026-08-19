import { userDb } from '@/lib/tenant-db'
import { createAssetSchema } from '../schemas'
import { getReferenceRates, calcFixedIncomeValue } from '@/lib/rates'

interface AssetWithRelations {
  id: string
  ticker: string
  type: string
  rateType: 'CDI_PERCENT' | 'SELIC_PLUS' | 'PREFIXADO' | 'IPCA_PLUS' | null
  rate: number | null
  transactions: { type: string; quantity: number; price: number; date: Date }[]
}

// Ativos de renda fixa (CDB, Tesouro Direto) são valorizados por juros
// compostos a partir da taxa contratada, em vez de "preço médio × quantidade".
const isFixedIncomeType = (type: string) => type === 'CDB' || type === 'TESOURO'

export async function listAssets(userId: string) {
  const db = userDb(userId)
  // O wrapper multi-tenant (tenant-db.ts) não repassa o shape do `include` ao
  // tipo de retorno — asserção explícita, já que sabemos o formato real em
  // runtime (transactions/alerts sempre vêm por causa do include abaixo).
  const assets = (await db.asset.findMany({
    orderBy: { ticker: 'asc' },
    include: {
      transactions: { orderBy: { date: 'desc' } },
      alerts: { where: { active: true } },
    },
  })) as unknown as AssetWithRelations[]

  const hasFixedIncome = assets.some((a) => isFixedIncomeType(a.type))
  if (!hasFixedIncome) return assets.map((a) => ({ ...a, fixedIncomeCurrentValue: null, principal: null }))

  let rates: Awaited<ReturnType<typeof getReferenceRates>> | null = null
  try {
    rates = await getReferenceRates()
  } catch (err) {
    console.error('[assets] falha ao buscar taxas de referência (CDI/Selic/IPCA):', err)
  }

  return assets.map((asset) => {
    if (!isFixedIncomeType(asset.type)) return { ...asset, fixedIncomeCurrentValue: null, principal: null }

    // Principal = soma de aportes (BUY) - resgates (SELL), a valor de face
    // (quantity=1 sempre nessas transações; price = valor do aporte/resgate)
    const principal = asset.transactions.reduce((sum, t) => {
      const amount = Number(t.quantity) * Number(t.price)
      if (t.type === 'BUY') return sum + amount
      if (t.type === 'SELL') return sum - amount
      return sum
    }, 0)

    if (!asset.rateType || asset.rate == null || !rates || principal <= 0) {
      return { ...asset, fixedIncomeCurrentValue: null, principal }
    }
    const firstBuy = [...asset.transactions].filter((t) => t.type === 'BUY').sort((a, b) => a.date.getTime() - b.date.getTime())[0]
    if (!firstBuy) return { ...asset, fixedIncomeCurrentValue: null, principal }

    const fixedIncomeCurrentValue = calcFixedIncomeValue({
      principal,
      rateType: asset.rateType,
      rate: Number(asset.rate),
      purchaseDate: firstBuy.date,
      cdiAnnual: rates.cdiAnnual,
      selicAnnual: rates.selicAnnual,
      ipca12m: rates.ipca12m,
    })
    return { ...asset, fixedIncomeCurrentValue, principal }
  })
}

export async function createAsset(userId: string, data: unknown) {
  const validated = createAssetSchema.parse(data)
  const db = userDb(userId)
  return db.asset.create({
    data: {
      ...validated,
      maturityDate: validated.maturityDate ? new Date(validated.maturityDate + 'T00:00:00Z') : undefined,
    },
  })
}

export async function deleteAsset(userId: string, id: string) {
  const db = userDb(userId)
  return db.asset.delete({ where: { id } })
}

export function calcAveragePrice(transactions: { type: string; quantity: number; price: number }[]) {
  let totalQuantity = 0
  let totalCost = 0

  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      totalQuantity += tx.quantity
      totalCost += tx.quantity * tx.price
    } else if (tx.type === 'BONUS') {
      // Bonificação: aumenta a quantidade sem custo adicional (dilui o preço médio)
      totalQuantity += tx.quantity
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
    .filter((t) => t.type === 'BUY' || t.type === 'BONUS')
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
