import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

interface SummaryCardsProps {
  transactions: unknown[]
  assets: unknown[]
  isLoading?: boolean
}

function SkeletonCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

export function SummaryCards({ transactions, assets, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard icon={<TrendingUp className="h-4 w-4 text-green-500" />} label="Receitas" />
        <SkeletonCard icon={<TrendingDown className="h-4 w-4 text-red-500" />} label="Despesas" />
        <SkeletonCard icon={<Wallet className="h-4 w-4 text-blue-500" />} label="Saldo" />
        <SkeletonCard icon={<PiggyBank className="h-4 w-4 text-purple-500" />} label="Investido" />
      </div>
    )
  }

  const txArray = transactions as Array<{ type: string; amount: number }>
  const income = txArray
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expense = txArray
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const assetArray = assets as Array<{ transactions: Array<{ type: string; quantity: number; price: number }> }>
  const totalInvested = assetArray.reduce((sum, asset) => {
    const buys = asset.transactions.filter((t) => t.type === 'BUY')
    const sells = asset.transactions.filter((t) => t.type === 'SELL')
    const qty = buys.reduce((s, t) => s + t.quantity, 0) - sells.reduce((s, t) => s + t.quantity, 0)
    const avgPrice =
      buys.length > 0
        ? buys.reduce((s, t) => s + t.quantity * t.price, 0) / buys.reduce((s, t) => s + t.quantity, 0)
        : 0
    return sum + qty * avgPrice
  }, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(income)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(expense)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${income - expense >= 0 ? '' : 'text-red-500'}`}>{formatCurrency(income - expense)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Investido</CardTitle>
          <PiggyBank className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
