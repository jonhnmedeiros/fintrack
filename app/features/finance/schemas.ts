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
  walletId: z.string().min(1, 'Conta é obrigatória'),
  toWalletId: z.string().optional(),
  installmentNumber: z.number().optional(),
  totalInstallments: z.number().int().min(1).max(48).optional(),
  userId: z.string(),
})

function refineTransfer<T extends z.ZodType<{ type: string; walletId: string; toWalletId?: string }>>(schema: T) {
  return schema.refine(
    (data) => data.type !== 'TRANSFER' || (!!data.toWalletId && data.toWalletId !== data.walletId),
    { message: 'Selecione uma conta de destino diferente da conta de origem', path: ['toWalletId'] }
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

export const createTransactionSchema = refineTransfer(transactionSchema.omit({ id: true, userId: true }))
export const updateTransactionSchema = refineTransfer(transactionSchema.omit({ id: true, userId: true }))
export const createCategorySchema = categorySchema.omit({ id: true, userId: true })
export const createCreditCardSchema = creditCardSchema.omit({ id: true, userId: true })
export const createBudgetSchema = budgetSchema.omit({ id: true, userId: true })
export const createWalletSchema = walletSchema.omit({ id: true, userId: true })
