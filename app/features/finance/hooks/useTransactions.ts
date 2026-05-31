import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useTransactions(filters?: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.categoryId) params.set('categoryId', filters.categoryId)
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)

  return useQuery({
    queryKey: ['transactions', params.toString()],
    queryFn: () => fetch(`/api/transactions?${params}`).then((r) => r.json()),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/transactions', {
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/transactions/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao excluir transação' }))
          throw new Error(err.error || 'Erro ao excluir transação')
        }
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao atualizar transação' }))
          throw new Error(err.error || 'Erro ao atualizar transação')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
