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

  const assetArray = assets as Array<{ type: string; transactions: Array<{ type: string; quantity: number | string; price: number | string }> }>
  const totalInvested = assetArray.reduce((sum, asset) => {
    if (asset.type === 'CDB') {
      // CDB: quantity é sempre 1 (aporte/resgate) — o "preço" é o valor em
      // reais movimentado. Fluxo de caixa simples, igual ao principal
      // calculado em assets.ts (não é preço médio por cota).
      const principal = asset.transactions.reduce((s, t) => {
        const amount = Number(t.quantity) * Number(t.price)
        if (t.type === 'BUY') return s + amount
        if (t.type === 'SELL') return s - amount
        return s
      }, 0)
      return sum + Math.max(0, principal)
    }
    const buys = asset.transactions.filter((t) => t.type === 'BUY' || t.type === 'BONUS')
    const sells = asset.transactions.filter((t) => t.type === 'SELL')
    const buyQty = buys.reduce((s, t) => s + Number(t.quantity), 0)
    const qty = buyQty - sells.reduce((s, t) => s + Number(t.quantity), 0)
    // Bonificação não tem custo — só entra na quantidade, não no total pago.
    const buyCost = asset.transactions
      .filter((t) => t.type === 'BUY')
      .reduce((s, t) => s + Number(t.quantity) * Number(t.price), 0)
    // Evita NaN quando a quantidade comprada é zero (avgPrice = 0/0)
    const avgPrice = buyQty > 0 ? buyCost / buyQty : 0
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
