import { z } from 'zod'

export const assetSchema = z.object({
  id: z.string(),
  ticker: z.string().min(1).max(50),
  name: z.string().optional(),
  type: z.enum(['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'CDB', 'OTHER']),
  market: z.string().optional(),
  rateType: z.enum(['CDI_PERCENT', 'PREFIXADO', 'IPCA_PLUS']).optional(),
  rate: z.number().positive().optional(),
  maturityDate: z.string().optional(),
  issuer: z.string().optional(),
  userId: z.string(),
})

function refineFixedIncomeRate<T extends z.ZodType<{ type: string; rateType?: string; rate?: number }>>(schema: T) {
  return schema.refine(
    (data) => data.type !== 'CDB' || (!!data.rateType && data.rate !== undefined),
    { message: 'Informe o tipo e o valor da taxa contratada', path: ['rate'] }
  )
}

export const investmentTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'TAX', 'BONUS']),
  quantity: z.number().positive(),
  // Bonificação (ações recebidas sem custo) tem preço 0 — os demais tipos
  // continuam com preço positivo garantido pela UI (campo escondido/fixo).
  price: z.number().min(0),
  fees: z.number().default(0),
  taxes: z.number().default(0),
  date: z.string(),
  assetId: z.string(),
  userId: z.string(),
})

export const alertSchema = z.object({
  id: z.string(),
  type: z.enum(['PRICE', 'VOLUME', 'DIVIDEND', 'OTHER']),
  targetPrice: z.number().optional(),
  message: z.string(),
  active: z.boolean().default(true),
  assetId: z.string().optional(),
  userId: z.string(),
})

export const createAssetSchema = refineFixedIncomeRate(assetSchema.omit({ id: true, userId: true }))
export const createInvestmentTransactionSchema = investmentTransactionSchema.omit({ id: true, userId: true })
export const createAlertSchema = alertSchema.omit({ id: true, userId: true })
