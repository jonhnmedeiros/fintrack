import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CashFlowChartProps {
  transactions: Array<{ type: string; amount: number; date: string }>
  isLoading?: boolean
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
