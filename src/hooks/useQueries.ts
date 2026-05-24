import { useQuery } from '@tanstack/react-query'
import { useFinanceStore } from '@/store/useFinanceStore'

export function useTransactions() {
  const transactions = useFinanceStore((s) => s.transactions)
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactions,
    initialData: transactions,
    staleTime: Infinity,
  })
}

export function useAccounts() {
  const accounts = useFinanceStore((s) => s.accounts)
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accounts,
    initialData: accounts,
    staleTime: Infinity,
  })
}

export function useInvestments() {
  const investments = useFinanceStore((s) => s.investments)
  return useQuery({
    queryKey: ['investments'],
    queryFn: () => investments,
    initialData: investments,
    staleTime: Infinity,
  })
}

export function useGoals() {
  const goals = useFinanceStore((s) => s.goals)
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => goals,
    initialData: goals,
    staleTime: Infinity,
  })
}

export function useBudgets() {
  const budgets = useFinanceStore((s) => s.budgets)
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgets,
    initialData: budgets,
    staleTime: Infinity,
  })
}
