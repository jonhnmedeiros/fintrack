import { useFinanceStore } from '@/store/useFinanceStore'
import { formatCurrency, categoryLabels, categoryColors, categoryIcons } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plus, AlertTriangle } from 'lucide-react'

export function BudgetPage() {
  const { budgets, transactions } = useFinanceStore()

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthExpenses = transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00')
    return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = monthExpenses.reduce((s, t) => s + t.amount, 0)

  const budgetItems = budgets.map((b) => {
    const spent = monthExpenses
      .filter((t) => t.category === b.category)
      .reduce((s, t) => s + t.amount, 0)
    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0
    const remaining = b.limit - spent
    return { ...b, spent, pct, remaining }
  })

  return (
    <div className="p-6 space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Orçamento</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Controle seus gastos por categoria</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Nova categoria
        </button>
      </div>

      {/* Overview */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-300">Orçamento Total do Mês</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-semibold font-mono text-zinc-100">{formatCurrency(totalSpent)}</span>
              <span className="text-sm text-zinc-500">de {formatCurrency(totalBudget)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Disponível</p>
            <p className={cn('text-lg font-semibold font-mono', totalBudget - totalSpent >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatCurrency(totalBudget - totalSpent)}
            </p>
          </div>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', totalSpent / totalBudget > 0.9 ? 'bg-red-500' : totalSpent / totalBudget > 0.7 ? 'bg-amber-500' : 'bg-brand-500')}
            style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500">{((totalSpent / totalBudget) * 100).toFixed(1)}% do orçamento utilizado</p>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-2 gap-3">
        {budgetItems.map((item) => {
          const color = categoryColors[item.category as keyof typeof categoryColors] || '#6b7280'
          const isOver = item.pct > 100
          const isWarning = item.pct > 80 && !isOver
          return (
            <div key={item.id} className="card-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{categoryIcons[item.category as keyof typeof categoryIcons]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-100">{categoryLabels[item.category as keyof typeof categoryLabels]}</span>
                    {isOver && (
                      <span className="flex items-center gap-1 badge badge-red">
                        <AlertTriangle size={10} />
                        Excedido
                      </span>
                    )}
                    {isWarning && <span className="badge badge-amber">Atenção</span>}
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{item.pct.toFixed(0)}%</span>
              </div>

              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(item.pct, 100)}%`,
                    background: isOver ? '#ef4444' : isWarning ? '#f59e0b' : color
                  }}
                />
              </div>

              <div className="flex justify-between text-xs">
                <span className={cn('font-mono font-medium', isOver ? 'text-red-400' : 'text-zinc-300')}>
                  {formatCurrency(item.spent)}
                </span>
                <span className="text-zinc-500 font-mono">/ {formatCurrency(item.limit)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
