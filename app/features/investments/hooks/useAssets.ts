import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useAssets() {
  return useQuery({ queryKey: ['assets'], queryFn: () => fetch('/api/assets').then((r) => r.json()) })
}

export function useCreateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao criar ativo' }))
          throw new Error(err.error || 'Erro ao criar ativo')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  })
}

export function useDeleteAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/assets/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao excluir ativo' }))
          throw new Error(err.error || 'Erro ao excluir ativo')
        }
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  })
}
