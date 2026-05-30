import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await fetch('/api/invites/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao criar convite' }))
        throw new Error(err.error || 'Erro ao criar convite')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invites'] })
      toast.success('Convite enviado com sucesso!')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar convite')
    },
  })
}

export function useAcceptInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao aceitar convite' }))
        throw new Error(err.error || 'Erro ao aceitar convite')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invites'] })
      toast.success('Convite aceito! Agora você é um Visualizador.')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Erro ao aceitar convite')
    },
  })
}
