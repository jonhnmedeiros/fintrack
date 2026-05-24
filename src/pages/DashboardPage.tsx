import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useFinanceStore } from '@/store/useFinanceStore'
import { formatCurrency, formatDate, formatPercent, getTransactionTypeColor, categoryLabels, categoryColors } from '@/lib/utils'
import { mockMonthlyData } from '@/lib/mockData'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { accounts, transactions, investments, goals } = useFinanceStore()

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const totalInvested = investments.reduce((s, i) => s + i.quantity * i.avgPrice, 0)
  const totalCurrentInv = investments.reduce((s, i) => s + i.quantity * i.currentPrice, 0)
  const invReturn = totalCurrentInv - totalInvested
  const invReturnPct = totalInvested > 0 ? (invReturn / totalInvested) * 100 : 0

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Expense by category pie data
  const expenseByCat = monthTx
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  const pieData = Object.entries(expenseByCat)
    .map(([cat, value]) => ({ name: categoryLabels[cat as keyof typeof categoryLabels] || cat, value, color: categoryColors[cat as keyof typeof categoryColors] || '#6b7280' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const recentTx = transactions.slice(0, 6)

  return (
    <div className="p-6 space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Visão geral das suas finanças</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          label="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={<Wallet size={18} />}
          color="brand"
          sub="Todas as contas"
        />
        <SummaryCard
          label="Receitas (Mês)"
          value={formatCurrency(monthIncome)}
          icon={<TrendingUp size={18} />}
          color="green"
          sub={`${monthTx.filter((t) => t.type === 'income').length} transações`}
        />
        <SummaryCard
          label="Despesas (Mês)"
          value={formatCurrency(monthExpense)}
          icon={<TrendingDown size={18} />}
          color="red"
          sub={`${monthTx.filter((t) => t.type === 'expense').length} transações`}
        />
        <SummaryCard
          label="Investimentos"
          value={formatCurrency(totalCurrentInv)}
          icon={<Target size={18} />}
          color="amber"
          sub={
            <span className={invReturn >= 0 ? 'text-green-400' : 'text-red-400'}>
              {invReturn >= 0 ? <ArrowUpRight size={12} className="inline" /> : <ArrowDownRight size={12} className="inline" />}
              {formatPercent(invReturnPct)}
            </span>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-medium text-zinc-100">Fluxo de Caixa</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />Receitas</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Despesas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockMonthlyData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                labelStyle={{ color: '#a1a1aa', fontSize: 12 }}
                itemStyle={{ fontSize: 13 }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" name="Receitas" />
              <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="mb-4">
            <h2 className="font-medium text-zinc-100">Despesas por Categoria</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Mês atual</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                itemStyle={{ fontSize: 13 }}
                formatter={(v: number) => formatCurrency(v)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="text-zinc-300 font-medium font-mono">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-zinc-100">Transações Recentes</h2>
            <a href="/transactions" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todas →</a>
          </div>
          <div className="space-y-1">
            {recentTx.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-base shrink-0">
                  {t.type === 'income' ? '📈' : t.type === 'expense' ? '📤' : '🔄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{t.description}</p>
                  <p className="text-xs text-zinc-500">{formatDate(t.date)}</p>
                </div>
                <span className={cn('text-sm font-semibold font-mono', getTransactionTypeColor(t.type))}>
                  {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                  {formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-zinc-100">Metas</h2>
            <a href="/goals" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todas →</a>
          </div>
          <div className="space-y-3">
            {goals.map((g) => {
              const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
              return (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{g.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-zinc-100 truncate">{g.name}</span>
                        <span className="text-xs text-zinc-500 shrink-0 ml-2">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-zinc-500">
                        <span>{formatCurrency(g.currentAmount)}</span>
                        <span>{formatCurrency(g.targetAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, icon, color, sub }: {
  label: string; value: string; icon: React.ReactNode; color: string; sub: React.ReactNode
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-500/15 text-brand-400',
    green: 'bg-green-500/15 text-green-400',
    red: 'bg-red-500/15 text-red-400',
    amber: 'bg-amber-500/15 text-amber-400',
    blue: 'bg-blue-500/15 text-blue-400',
  }
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorMap[color])}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-semibold font-mono text-zinc-100">{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
