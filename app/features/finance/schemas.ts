import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  userId: z.string(),
})

export const walletSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER']),
  color: z.string().optional(),
  icon: z.string().optional(),
  userId: z.string(),
})

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number({ coerce: true }).positive(),
  description: z.string().optional(),
  date: z.string(),
  categoryId: z.string().optional(),
  creditCardId: z.string().optional(),
  // Compra no cartão de crédito não debita conta na hora — só quando a
  // fatura é paga (ver features/finance/api/credit-cards.ts payInvoice) —
  // então walletId só é obrigatório quando não há cartão selecionado
  // (garantido pelo refineWallet abaixo).
  walletId: z.string().optional(),
  toWalletId: z.string().optional(),
  installmentNumber: z.number().optional(),
  totalInstallments: z.number().int().min(1).max(48).optional(),
  userId: z.string(),
})

function refineTransfer<T extends z.ZodType<{ type: string; walletId?: string; toWalletId?: string }>>(schema: T) {
  return schema.refine(
    (data) => data.type !== 'TRANSFER' || (!!data.toWalletId && data.toWalletId !== data.walletId),
    { message: 'Selecione uma conta de destino diferente da conta de origem', path: ['toWalletId'] }
  )
}

function refineWallet<T extends z.ZodType<{ walletId?: string; creditCardId?: string }>>(schema: T) {
  return schema.refine(
    (data) => !!data.walletId || !!data.creditCardId,
    { message: 'Selecione uma conta ou um cartão de crédito', path: ['walletId'] }
  )
}

export const creditCardSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  billingDay: z.number().min(1).max(31).optional(),
  closingDay: z.number().min(1).max(31).optional(),
  limit: z.number().optional(),
  userId: z.string(),
})

export const budgetSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  amount: z.number().positive(),
  month: z.number().min(1).max(12),
  year: z.number(),
  userId: z.string(),
})

export const createTransactionSchema = refineWallet(refineTransfer(transactionSchema.omit({ id: true, userId: true })))
export const updateTransactionSchema = refineWallet(refineTransfer(transactionSchema.omit({ id: true, userId: true })))
export const createCategorySchema = categorySchema.omit({ id: true, userId: true })
export const createCreditCardSchema = creditCardSchema.omit({ id: true, userId: true })
// Edição: os 3 campos numéricos aceitam null explícito (ex: remover o
// limite) — diferente da criação, onde "não informar" já basta.
export const updateCreditCardSchema = z.object({
  name: z.string().min(1).max(50),
  billingDay: z.number().min(1).max(31).nullable().optional(),
  closingDay: z.number().min(1).max(31).nullable().optional(),
  limit: z.number().nullable().optional(),
})
export const createBudgetSchema = budgetSchema.omit({ id: true, userId: true })
export const createWalletSchema = walletSchema.omit({ id: true, userId: true })
