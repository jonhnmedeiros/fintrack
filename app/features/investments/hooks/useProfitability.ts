import { useQuery } from '@tanstack/react-query'

export interface ProfitDataPoint {
  month: string
  cost: number
  marketValue: number
  profit: number
}

export function useProfitability() {
  return useQuery<{ data: ProfitDataPoint[] }>({
    queryKey: ['profitability'],
    queryFn: () => fetch('/api/investments/profitability').then((r) => r.json()),
  })
}
