import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => fetch('/api/alerts').then((r) => r.json()),
  })
}

export function useCreateAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function useDeleteAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/alerts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
