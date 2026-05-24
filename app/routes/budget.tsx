import { createFileRoute } from '@tanstack/start'
import { useBudgets } from '@/features/finance/hooks/useBudgets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
})

function BudgetPage() {
  const { data, isLoading } = useBudgets()

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orçamento</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data || []).map((budget: { id: string; category: { name: string; color?: string }; amount: number }) => (
          <Card key={budget.id}>
            <CardHeader>
              <CardTitle className="text-sm">{budget.category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(Number(budget.amount))}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
