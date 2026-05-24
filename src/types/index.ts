export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment_return'
  | 'other_income'
  | 'housing'
  | 'food'
  | 'transport'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'other_expense'
  | 'transfer'

export type InvestmentType = 'stock' | 'fii' | 'tesouro' | 'cdb' | 'crypto' | 'fund' | 'other'

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  date: string
  accountId: string
  tags?: string[]
  notes?: string
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'investment' | 'credit'
  balance: number
  currency: 'BRL' | 'USD'
  color: string
  icon: string
}

export interface Investment {
  id: string
  type: InvestmentType
  ticker: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  currency: 'BRL' | 'USD'
  purchaseDate: string
  broker: string
  sector?: string
}

export interface Budget {
  id: string
  category: TransactionCategory
  limit: number
  period: 'monthly' | 'yearly'
  year: number
  month?: number
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  icon: string
  color: string
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
  investments: number
}
