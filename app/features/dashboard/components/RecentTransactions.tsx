import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

interface RecentTransactionsProps {
  transactions: Array<{ id: string; type: string; description: string | null; amount: number; date: string; category: { name: string } | null }>
  isLoading?: boolean
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Nenhuma transação neste mês</p>
            <Link to="/transactions" className="text-sm text-primary hover:underline mt-1 inline-block">
              Ir para Transações
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{tx.description || tx.category?.name || 'Sem descrição'}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                </div>
                <span className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
