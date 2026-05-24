import { z } from 'zod'

export const assetSchema = z.object({
  id: z.string(),
  ticker: z.string().min(1).max(20),
  name: z.string().optional(),
  type: z.enum(['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'OTHER']),
  market: z.string().optional(),
  userId: z.string(),
})

export const investmentTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'TAX']),
  quantity: z.number().positive(),
  price: z.number().positive(),
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

export const createAssetSchema = assetSchema.omit({ id: true, userId: true })
export const createInvestmentTransactionSchema = investmentTransactionSchema.omit({ id: true, userId: true })
export const createAlertSchema = alertSchema.omit({ id: true, userId: true })
