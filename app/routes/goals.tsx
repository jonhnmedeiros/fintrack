import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/goals')({
  component: GoalsPage,
})

function GoalsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Metas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Funcionalidade de metas em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  )
}
