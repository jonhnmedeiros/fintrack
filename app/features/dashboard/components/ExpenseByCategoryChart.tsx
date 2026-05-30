import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ExpenseByCategoryChartProps {
  transactions: Array<{ type: string; amount: number; category: { name: string } | null }>
  isLoading?: boolean
}

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export function ExpenseByCategoryChart({ transactions, isLoading }: ExpenseByCategoryChartProps) {
  const categoryData = transactions
    .filter((t) => t.type === 'EXPENSE' && t.category)
    .reduce((acc, tx) => {
      const name = tx.category!.name
      if (!acc[name]) acc[name] = { name, value: 0 }
      acc[name].value += Number(tx.amount)
      return acc
    }, {} as Record<string, { name: string; value: number }>)

  const data = Object.values(categoryData)

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
        <CardContent><div className="h-[300px] animate-pulse rounded bg-muted" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma despesa neste mês
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
