import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useProfitability, type ProfitDataPoint } from '../hooks/useProfitability'
import { TrendingUp } from 'lucide-react'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const [month, year] = (label || '').split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const monthLabel = months[parseInt(month, 10) - 1] || month
  return (
    <div className="bg-popover border rounded-lg shadow-md p-3 text-xs space-y-1">
      <p className="font-medium">{monthLabel}/{year}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span>{entry.name === 'cost' ? 'Custo' : 'Mercado'}</span>
          <span className="font-mono">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function ProfitChart() {
  const { data, isLoading, isError } = useProfitability()
  const points: ProfitDataPoint[] = data?.data ?? []

  if (isLoading) {
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium">Rentabilidade</h3>
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-[220px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="p-4">
        <div className="h-[250px] flex flex-col items-center justify-center text-red-500">
          <p className="text-sm font-medium">Erro ao carregar rentabilidade</p>
        </div>
      </Card>
    )
  }

  if (points.length === 0) {
    return (
      <Card className="p-4">
        <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
          <TrendingUp className="h-8 w-8 mb-2" />
          <p className="text-sm">Adicione investimentos para ver o gráfico de rentabilidade</p>
        </div>
      </Card>
    )
  }

  const current = points[points.length - 1]

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium">Rentabilidade</h3>
        <div className="text-right text-xs">
          <div className={current.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
            <span className="font-mono text-sm font-semibold">{formatCurrency(current.profit)}</span>
            <span className="ml-1">({current.profit >= 0 ? '+' : ''}{current.cost > 0 ? ((current.profit / current.cost) * 100).toFixed(1) : '0.0'}%)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={points} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMkt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => {
              const [, m] = v.split('-')
              const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
              return months[parseInt(m, 10) - 1] || m
            }}
          />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (value === 'cost' ? 'Custo' : 'Mercado')}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Area type="monotone" dataKey="cost" stroke="#3b82f6" fill="url(#colorCost)" strokeWidth={2} name="cost" />
          <Area type="monotone" dataKey="marketValue" stroke="#22c55e" fill="url(#colorMkt)" strokeWidth={2} name="marketValue" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
