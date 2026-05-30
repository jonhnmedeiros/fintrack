import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { UserPlus, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserRole } from '@/features/auth/hooks/useUserRole'
import { InviteForm } from '@/features/settings/components/InviteForm'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { isVisualizador } = useUserRole()
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Multiusuário</CardTitle>
              <p className="text-sm text-muted-foreground">
                Convide outras pessoas para acompanhar suas finanças
              </p>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {isVisualizador ? (
            <p className="text-sm text-muted-foreground">
              Você é um Visualizador. Apenas Titulares podem convidar novos usuários.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Como Titular, você pode convidar pessoas para visualizar suas finanças. 
                Convidados terão acesso de leitura a todos os seus dados.
              </p>
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Visualizador
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteForm open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
