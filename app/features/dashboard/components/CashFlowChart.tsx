import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface CashFlowChartProps {
  transactions: Array<{ type: string; amount: number; date: string }>
  isLoading?: boolean
}

const chartConfig = {
  income: { label: 'Receitas', color: '#22c55e' },
  expense: { label: 'Despesas', color: '#ef4444' },
}

export function CashFlowChart({ transactions, isLoading }: CashFlowChartProps) {
  const monthlyMap = transactions.reduce((acc, tx) => {
    const d = new Date(tx.date)
    const key = format(d, 'yyyy-MM')
    if (!acc[key]) acc[key] = { month: key, label: format(d, 'MMM', { locale: ptBR }), income: 0, expense: 0 }
    if (tx.type === 'INCOME') acc[key].income += Number(tx.amount)
    if (tx.type === 'EXPENSE') acc[key].expense += Number(tx.amount)
    return acc
  }, {} as Record<string, { month: string; label: string; income: number; expense: number }>)

  const data = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Fluxo de Caixa</CardTitle></CardHeader>
        <CardContent><div className="h-[300px] animate-pulse rounded bg-muted" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum dado disponível
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="income" stackId="1" stroke="var(--color-income)" fill="var(--color-income)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="expense" stackId="2" stroke="var(--color-expense)" fill="var(--color-expense)" fillOpacity={0.3} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
