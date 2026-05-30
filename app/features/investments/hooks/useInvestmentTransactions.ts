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
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao criar transação' }))
          throw new Error(err.error || 'Erro ao criar transação')
        }
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-transactions'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export function useDeleteInvestmentTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/investment-transactions/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao excluir transação' }))
          throw new Error(err.error || 'Erro ao excluir transação')
        }
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-transactions'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
