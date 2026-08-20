import { z } from 'zod'

// Ativos de renda fixa (CDB, Tesouro Direto) usam os mesmos campos de
// taxa/vencimento/emissor — distintos dos demais tipos (ações, ETFs etc).
export const FIXED_INCOME_ASSET_TYPES = ['CDB', 'TESOURO'] as const

export const assetSchema = z.object({
  id: z.string(),
  ticker: z.string().min(1).max(50),
  name: z.string().optional(),
  type: z.enum(['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'CDB', 'TESOURO', 'OTHER']),
  market: z.string().optional(),
  rateType: z.enum(['CDI_PERCENT', 'SELIC_PLUS', 'PREFIXADO', 'IPCA_PLUS']).optional(),
  // Sem .positive(): Tesouro Selic pode ter spread negativo (deságio, ex:
  // "Selic - 0,05% a.a.").
  rate: z.number().optional(),
  maturityDate: z.string().optional(),
  issuer: z.string().optional(),
  userId: z.string(),
})

function refineFixedIncomeRate<T extends z.ZodType<{ type: string; rateType?: string; rate?: number }>>(schema: T) {
  return schema.refine(
    (data) => !FIXED_INCOME_ASSET_TYPES.includes(data.type as 'CDB' | 'TESOURO') || (!!data.rateType && data.rate !== undefined),
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
  // Conta (ex: "Investimentos") a debitar/creditar automaticamente ao
  // registrar o movimento — opcional. Bonificação nunca gera lançamento na
  // conta (não há dinheiro envolvido), mesmo se uma conta for selecionada.
  walletId: z.string().optional(),
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
// Edição: mesmos campos, todos opcionais (atualização parcial) — sem o
// refine de renda fixa, já que um PATCH pode alterar só o `type`, por
// exemplo, sem reenviar taxa/vencimento.
export const updateAssetSchema = assetSchema.omit({ id: true, userId: true }).partial()
export const createInvestmentTransactionSchema = investmentTransactionSchema.omit({ id: true, userId: true })
export const createAlertSchema = alertSchema.omit({ id: true, userId: true })
