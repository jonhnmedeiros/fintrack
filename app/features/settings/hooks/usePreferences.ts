import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useInvestPreferences() {
  return useQuery({
    queryKey: ['invest-preferences'],
    queryFn: () => fetch('/api/settings/preferences').then((r) => r.json()),
  })
}

export function useUpdateInvestPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { investExpenseCategoryId?: string | null; investIncomeCategoryId?: string | null }) =>
      fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao salvar preferências' }))
          throw new Error(err.error || 'Erro ao salvar preferências')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invest-preferences'] }),
  })
}
