import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

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

  const chartConfig: ChartConfig = data.reduce((acc, item, idx) => {
    acc[item.name] = { label: item.name, color: COLORS[idx % COLORS.length] }
    return acc
  }, {} as ChartConfig)

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
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
