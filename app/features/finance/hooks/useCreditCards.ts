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
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao criar cartão' }))
          throw new Error(err.error || 'Erro ao criar cartão')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] }),
  })
}

export function useUpdateCreditCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetch(`/api/credit-cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao atualizar cartão' }))
          throw new Error(err.error || 'Erro ao atualizar cartão')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] }),
  })
}

export function useCreditCardInvoices(cardId: string | null) {
  return useQuery({
    queryKey: ['credit-card-invoices', cardId],
    queryFn: () => fetch(`/api/credit-card-invoices?cardId=${cardId}`).then((r) => r.json()),
    enabled: !!cardId,
  })
}

export function usePayInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { cardId: string; month: number; year: number; walletId: string; date: string; categoryId?: string }) =>
      fetch('/api/credit-card-invoices/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao pagar fatura' }))
          throw new Error(err.error || 'Erro ao pagar fatura')
        }
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-card-invoices'] })
      qc.invalidateQueries({ queryKey: ['credit-cards'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export function useDeleteCreditCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/credit-cards/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao excluir cartão' }))
          throw new Error(err.error || 'Erro ao excluir cartão')
        }
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] }),
  })
}
