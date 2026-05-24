import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then((r) => r.json()),
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
