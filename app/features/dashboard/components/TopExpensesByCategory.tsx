import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface CategoryInfo {
  id: string
  name: string
  parentId: string | null
}

interface Transaction {
  type: string
  amount: number
  category: CategoryInfo | null
}

interface TopExpensesByCategoryProps {
  transactions: Transaction[]
  isLoading?: boolean
}

export function TopExpensesByCategory({ transactions, isLoading }: TopExpensesByCategoryProps) {
  const expenses = transactions.filter(t => t.type === 'EXPENSE' && t.category)

  const categoryTotals = expenses.reduce((acc, tx) => {
    const cat = tx.category!
    if (!acc[cat.id]) {
      acc[cat.id] = { id: cat.id, name: cat.name, parentId: cat.parentId, total: 0 }
    }
    acc[cat.id].total += Number(tx.amount)
    return acc
  }, {} as Record<string, { id: string; name: string; parentId: string | null; total: number }>)

  const allCategories = Object.values(categoryTotals)
  const parentCategories = allCategories.filter(c => !c.parentId)
  const subcategories = allCategories.filter(c => c.parentId)

  const parentWithChildren = parentCategories.map(parent => ({
    ...parent,
    children: subcategories.filter(sub => sub.parentId === parent.id),
    totalWithChildren: parent.total + subcategories
      .filter(sub => sub.parentId === parent.id)
      .reduce((sum, sub) => sum + sub.total, 0),
  }))

  const totalExpenses = allCategories.reduce((sum, c) => sum + c.total, 0)
  const top5 = parentWithChildren
    .sort((a, b) => b.totalWithChildren - a.totalWithChildren)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maiores Gastos por Categoria</CardTitle>
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
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : top5.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Nenhuma despesa neste mês</p>
          </div>
        ) : (
          <div className="space-y-4">
            {top5.map((parent, idx) => {
              const pct = totalExpenses > 0 ? (parent.totalWithChildren / totalExpenses * 100).toFixed(1) : '0'
              return (
                <div key={parent.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground w-5">{idx + 1}</span>
                      <span className="font-medium">{parent.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-red-500">{formatCurrency(parent.totalWithChildren)}</span>
                      <span className="text-xs text-muted-foreground ml-2">{pct}%</span>
                    </div>
                  </div>
                  {parent.children.length > 0 && (
                    <div className="ml-7 space-y-1">
                      {parent.children
                        .sort((a, b) => b.total - a.total)
                        .map(child => {
                          const childPct = totalExpenses > 0 ? (child.total / totalExpenses * 100).toFixed(1) : '0'
                          return (
                            <div key={child.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{child.name}</span>
                              <div>
                                <span className="text-muted-foreground">{formatCurrency(child.total)}</span>
                                <span className="text-xs text-muted-foreground ml-2">{childPct}%</span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
