import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao criar categoria' }))
          throw new Error(err.error || 'Erro ao criar categoria')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao atualizar categoria' }))
          throw new Error(err.error || 'Erro ao atualizar categoria')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: 'Erro ao excluir categoria' }))
          throw new Error(err.error || 'Erro ao excluir categoria')
        }
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
