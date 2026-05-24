import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Account, Transaction, Investment, Budget, Goal } from '@/types'
import { mockAccounts, mockTransactions, mockInvestments, mockBudgets, mockGoals } from '@/lib/mockData'

interface FinanceStore {
  accounts: Account[]
  transactions: Transaction[]
  investments: Investment[]
  budgets: Budget[]
  goals: Goal[]

  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  addInvestment: (inv: Investment) => void
  updateInvestment: (id: string, inv: Partial<Investment>) => void
  deleteInvestment: (id: string) => void

  addGoal: (goal: Goal) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void

  updateAccount: (id: string, acc: Partial<Account>) => void
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      accounts: mockAccounts,
      transactions: mockTransactions,
      investments: mockInvestments,
      budgets: mockBudgets,
      goals: mockGoals,

      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      updateTransaction: (id, t) =>
        set((s) => ({ transactions: s.transactions.map((x) => (x.id === id ? { ...x, ...t } : x)) })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      addInvestment: (inv) => set((s) => ({ investments: [inv, ...s.investments] })),
      updateInvestment: (id, inv) =>
        set((s) => ({ investments: s.investments.map((x) => (x.id === id ? { ...x, ...inv } : x)) })),
      deleteInvestment: (id) =>
        set((s) => ({ investments: s.investments.filter((x) => x.id !== id) })),

      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      updateGoal: (id, goal) =>
        set((s) => ({ goals: s.goals.map((x) => (x.id === id ? { ...x, ...goal } : x)) })),

      updateAccount: (id, acc) =>
        set((s) => ({ accounts: s.accounts.map((x) => (x.id === id ? { ...x, ...acc } : x)) })),
    }),
    { name: 'fintrack-store' }
  )
)
