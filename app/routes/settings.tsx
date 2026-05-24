import { createFileRoute } from '@tanstack/start'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configurações da conta em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  )
}
