import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Array<{ id: string; type: string; description: string | null; amount: number; date: string; category: { name: string } | null }>
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
