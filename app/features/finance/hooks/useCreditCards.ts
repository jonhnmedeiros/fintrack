import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreditCards() {
  return useQuery({
    queryKey: ['credit-cards'],
    queryFn: () => fetch('/api/credit-cards').then((r) => r.json()),
  })
}

export function useCreateCreditCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] }),
  })
}

export function useDeleteCreditCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/credit-cards/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] }),
  })
}
