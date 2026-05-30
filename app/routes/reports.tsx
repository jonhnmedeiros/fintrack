import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Plus } from 'lucide-react'
import { useUserRole } from '@/features/auth/hooks/useUserRole'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  const { isVisualizador } = useUserRole()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Relatórios e exportação de dados</p>
          </div>
        </div>
        {!isVisualizador && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        )}
      </div>
      <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Em breve</p>
        <p className="text-sm">Relatórios detalhados estarão disponíveis em uma próxima versão.</p>
      </div>
    </div>
  )
}
