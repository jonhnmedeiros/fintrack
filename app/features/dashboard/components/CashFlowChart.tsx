import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CashFlowChartProps {
  transactions: Array<{ type: string; amount: number; date: string }>
}

export function CashFlowChart({ transactions }: CashFlowChartProps) {
  const monthlyData = transactions.reduce((acc, tx) => {
    const date = new Date(tx.date)
    const key = format(date, 'MMM', { locale: ptBR })
    if (!acc[key]) acc[key] = { month: key, income: 0, expense: 0 }
    if (tx.type === 'INCOME') acc[key].income += Number(tx.amount)
    if (tx.type === 'EXPENSE') acc[key].expense += Number(tx.amount)
    return acc
  }, {} as Record<string, { month: string; income: number; expense: number }>)

  const data = Object.values(monthlyData).slice(-6)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
