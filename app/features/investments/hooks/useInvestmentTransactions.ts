import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useInvestmentTransactions(assetId?: string) {
  const params = new URLSearchParams()
  if (assetId) params.set('assetId', assetId)

  return useQuery({
    queryKey: ['investment-transactions', params.toString()],
    queryFn: () => fetch(`/api/investment-transactions?${params}`).then((r) => r.json()),
  })
}

export function useCreateInvestmentTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/investment-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-transactions'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export function useDeleteInvestmentTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/investment-transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-transactions'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
