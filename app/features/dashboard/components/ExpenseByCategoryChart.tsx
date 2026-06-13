import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { formatCurrency } from '@/lib/utils'

interface CategoryInfo {
  id: string
  name: string
  parentId: string | null
}

interface ExpenseByCategoryChartProps {
  transactions: Array<{ type: string; amount: number; category: CategoryInfo | null }>
  isLoading?: boolean
}

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export function ExpenseByCategoryChart({ transactions, isLoading }: ExpenseByCategoryChartProps) {
  const categoryMap = new Map<string, { id: string; name: string; parentId: string | null }>()
  transactions
    .filter((t) => t.type === 'EXPENSE' && t.category)
    .forEach((tx) => {
      const cat = tx.category!
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, { id: cat.id, name: cat.name, parentId: cat.parentId })
      }
    })

  const parentMap = new Map<string, { name: string; value: number }>()
  transactions
    .filter((t) => t.type === 'EXPENSE' && t.category)
    .forEach((tx) => {
      const cat = tx.category!
      const parent = categoryMap.get(cat.parentId || cat.id) || { id: cat.id, name: cat.name, parentId: null }
      const parentName = cat.parentId ? parent.name : cat.name
      if (!parentMap.has(parentName)) {
        parentMap.set(parentName, { name: parentName, value: 0 })
      }
      parentMap.get(parentName)!.value += Number(tx.amount)
    })

  const data = Array.from(parentMap.values())

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
              <ChartTooltip content={<ChartTooltipContent formatter={(value: number, name: string) => {
                const label = chartConfig[name]?.label || name
                return (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">{formatCurrency(value)}</span>
                  </div>
                )
              }} />} />
              <ChartLegend content={<ChartLegendContent className="flex-wrap justify-start gap-2" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
