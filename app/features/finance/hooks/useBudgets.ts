import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useBudgets(year?: number, month?: number) {
  const params = new URLSearchParams()
  if (year) params.set('year', String(year))
  if (month) params.set('month', String(month))

  return useQuery({
    queryKey: ['budgets', params.toString()],
    queryFn: () => fetch(`/api/budgets?${params}`).then((r) => r.json()),
  })
}

export function useCreateOrUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao salvar orçamento' }))
          throw new Error(err.error || 'Erro ao salvar orçamento')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useCopyBudgets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { fromMonth: number; fromYear: number; toMonth: number; toYear: number }) =>
      fetch('/api/budget-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao copiar orçamentos' }))
          throw new Error(err.error || 'Erro ao copiar orçamentos')
        }
        return r.json() as Promise<{ copied: number }>
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/budgets/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao excluir orçamento' }))
          throw new Error(err.error || 'Erro ao excluir orçamento')
        }
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
