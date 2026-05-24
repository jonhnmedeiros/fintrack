import { useQuery } from '@tanstack/react-query'

export function useDashboardData() {
  const transactions = useQuery({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((r) => r.json()),
  })

  const assets = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then((r) => r.json()),
  })

  const budgets = useQuery({
    queryKey: ['budgets'],
    queryFn: () => fetch('/api/budgets').then((r) => r.json()),
  })

  return { transactions, assets, budgets }
}
