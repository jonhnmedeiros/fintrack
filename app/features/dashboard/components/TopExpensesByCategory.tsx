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
  categories: CategoryInfo[]
  isLoading?: boolean
}

export function TopExpensesByCategory({ transactions, categories, isLoading }: TopExpensesByCategoryProps) {
  const expenses = transactions.filter(t => t.type === 'EXPENSE' && t.category)
  const categoryById = new Map(categories.map(c => [c.id, c]))

  const parentMap = new Map<string, { id: string; name: string; total: number; children: { id: string; name: string; total: number }[] }>()
  expenses.forEach((tx) => {
    const cat = tx.category!
    const parentId = cat.parentId || cat.id
    const parentCat = categoryById.get(parentId) || cat
    if (!parentMap.has(parentId)) {
      parentMap.set(parentId, { id: parentCat.id, name: parentCat.name, total: 0, children: [] })
    }
    const parent = parentMap.get(parentId)!
    if (cat.parentId) {
      let child = parent.children.find(c => c.id === cat.id)
      if (!child) {
        child = { id: cat.id, name: cat.name, total: 0 }
        parent.children.push(child)
      }
      child.total += Number(tx.amount)
    } else {
      parent.total += Number(tx.amount)
    }
  })

  const allParents = Array.from(parentMap.values())
  const totalExpenses = allParents.reduce((sum, p) => sum + p.total + p.children.reduce((s, c) => s + c.total, 0), 0)
  const top5 = allParents
    .map(p => ({ ...p, totalWithChildren: p.total + p.children.reduce((s, c) => s + c.total, 0) }))
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
