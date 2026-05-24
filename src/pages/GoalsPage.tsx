import { Target, Plus, Calendar } from 'lucide-react'
import { useFinanceStore } from '@/store/useFinanceStore'
import { formatCurrency } from '@/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function GoalsPage() {
  const { goals } = useFinanceStore()

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0)

  return (
    <div className="p-6 space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Metas Financeiras</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{goals.length} metas ativas</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Nova meta
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-zinc-500">Total das Metas</p>
          <p className="text-xl font-semibold font-mono text-zinc-100 mt-1">{formatCurrency(totalTarget)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-zinc-500">Total Acumulado</p>
          <p className="text-xl font-semibold font-mono text-brand-400 mt-1">{formatCurrency(totalCurrent)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-zinc-500">Progresso Geral</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{((totalCurrent / totalTarget) * 100).toFixed(1)}%</span>
              <span>{formatCurrency(totalTarget - totalCurrent)} restante</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(totalCurrent / totalTarget) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
          const remaining = g.targetAmount - g.currentAmount
          const daysLeft = differenceInDays(parseISO(g.deadline), new Date())
          const isCompleted = pct >= 100
          const isUrgent = daysLeft < 60 && !isCompleted

          return (
            <div key={g.id} className="card space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-100">{g.name}</h3>
                    {isCompleted && <span className="badge badge-green">Concluída</span>}
                    {isUrgent && <span className="badge badge-amber">Urgente</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                    <Calendar size={12} />
                    <span>Prazo: {format(parseISO(g.deadline), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    {!isCompleted && <span className="text-zinc-600">({daysLeft} dias)</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold font-mono text-zinc-100">{formatCurrency(g.currentAmount)}</p>
                    <p className="text-xs text-zinc-500">acumulado</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold font-mono text-zinc-400">{formatCurrency(g.targetAmount)}</p>
                    <p className="text-xs text-zinc-500">objetivo</p>
                  </div>
                </div>
              </div>

              {!isCompleted && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">Faltam {formatCurrency(remaining)}</span>
                  <span className="text-xs font-medium" style={{ color: g.color }}>{pct.toFixed(1)}% concluído</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
