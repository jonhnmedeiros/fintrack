import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAcceptInvite } from '@/features/settings/hooks/useInvites'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/invites/accept')({
  component: AcceptInvitePage,
})

function AcceptInvitePage() {
  const search = useSearch({ from: '/invites/accept' })
  const navigate = useNavigate()
  const acceptInvite = useAcceptInvite()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const token = (search as { token?: string }).token

  useEffect(() => {
    if (!token) {
      setError('Link inválido: token não encontrado')
      setStatus('error')
      return
    }

    acceptInvite.mutateAsync(token).then(() => {
      setStatus('success')
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Erro ao aceitar convite')
      setStatus('error')
    })
  }, [token])

  const handleGoDashboard = () => navigate({ to: '/' })

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <CardTitle>Aceitando convite...</CardTitle>
              <p className="text-sm text-muted-foreground">Aguarde enquanto processamos seu convite.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <CardTitle>Convite aceito!</CardTitle>
              <p className="text-sm text-muted-foreground">
                Agora você é um Visualizador. Faça login para acompanhar as finanças.
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <CardTitle>Erro ao aceitar convite</CardTitle>
              <p className="text-sm text-muted-foreground">{error || 'Tente novamente mais tarde.'}</p>
            </>
          )}
        </CardHeader>
        <CardContent className="flex justify-center">
          {status !== 'loading' && (
            <Button onClick={status === 'success' ? () => navigate({ to: '/login' }) : handleGoDashboard}>
              {status === 'success' ? 'Ir para Login' : 'Voltar ao Início'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
