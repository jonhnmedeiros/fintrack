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

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string(),
  categoryId: z.string().optional(),
  creditCardId: z.string().optional(),
  installmentNumber: z.number().optional(),
  totalInstallments: z.number().int().min(1).max(48).optional(),
  userId: z.string(),
})

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

export const createTransactionSchema = transactionSchema.omit({ id: true, userId: true })
export const updateTransactionSchema = transactionSchema.omit({ id: true, userId: true })
export const createCategorySchema = categorySchema.omit({ id: true, userId: true })
export const createCreditCardSchema = creditCardSchema.omit({ id: true, userId: true })
export const createBudgetSchema = budgetSchema.omit({ id: true, userId: true })
