import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'

interface CategoryInfo {
  id: string
  name: string
  parentId: string | null
  type: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  date: string
  description: string | null
  category: CategoryInfo | null
}

interface CategorySpendingCardProps {
  transactions: Transaction[]
  categories: CategoryInfo[]
  isLoading?: boolean
}

export function CategorySpendingCard({ transactions, categories, isLoading }: CategorySpendingCardProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const expenseCategories = useMemo(() =>
    categories.filter(c => c.type === 'EXPENSE' && !c.parentId),
    [categories]
  )

  const spending = useMemo(() => {
    if (!selectedCategoryId) return { total: 0, count: 0, items: [] as Transaction[] }
    const childIds = categories
      .filter(c => c.parentId === selectedCategoryId)
      .map(c => c.id)
    const relevantIds = [selectedCategoryId, ...childIds]
    const relevant = transactions.filter(
      t => t.type === 'EXPENSE' && t.category && relevantIds.includes(t.category.id)
    )
    return {
      total: relevant.reduce((sum, t) => sum + Number(t.amount), 0),
      count: relevant.length,
      items: relevant.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }
  }, [selectedCategoryId, transactions, categories])

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Gastos por Categoria</CardTitle></CardHeader>
        <CardContent><div className="h-24 animate-pulse rounded bg-muted" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategoryId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {spending.count} {spending.count === 1 ? 'transação' : 'transações'}
                </p>
                <span className="text-2xl font-bold text-red-500">
                  {formatCurrency(spending.total)}
                </span>
              </div>
              {spending.items.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {spending.items.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <div>
                        <p className="font-medium">{tx.description || tx.category?.name || 'Sem descrição'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                      </div>
                      <span className="font-semibold text-red-500">{formatCurrency(Number(tx.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Selecione uma categoria para ver os gastos
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
