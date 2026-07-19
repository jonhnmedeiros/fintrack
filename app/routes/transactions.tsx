import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { TransactionTable } from '@/features/finance/components/TransactionTable'
import { TransactionForm } from '@/features/finance/components/TransactionForm'
import { useTransactions } from '@/features/finance/hooks/useTransactions'
import { useCategories } from '@/features/finance/hooks/useCategories'
import { useUserRole } from '@/features/auth/hooks/useUserRole'
import { Label } from '@/components/ui/label'
import { PeriodSelector } from '@/components/ui/period-selector'
import { formatCurrency } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const now = new Date()
  const [periodFilter, setPeriodFilter] = useState({
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  })
  const [editTx, setEditTx] = useState<{
    id: string
    type: string
    amount: number
    description: string | null
    date: string
    categoryId: string | null
    creditCardId: string | null
    installmentNumber: number | null
    totalInstallments: number | null
  } | null>(null)

  const filters: Record<string, string | undefined> = {}
  if (typeFilter && typeFilter !== '__all__') filters.type = typeFilter
  if (categoryFilter && categoryFilter !== '__all__') filters.categoryId = categoryFilter
  filters.startDate = periodFilter.startDate
  filters.endDate = periodFilter.endDate

  const { data, isLoading, isError } = useTransactions(filters)
  const { data: categories } = useCategories()
  const { isVisualizador } = useUserRole()

  const transactions = useMemo(() => (Array.isArray(data) ? data : []), [data])

  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of transactions) {
      if (t.type === 'INCOME') income += Number(t.amount)
      else if (t.type === 'EXPENSE') expense += Number(t.amount)
    }
    return { income, expense, balance: income - expense }
  }, [transactions])

  const filteredCategories = useMemo(() => {
    if (!categories) return []
    if (!typeFilter) return categories
    return categories.filter((c: { type: string }) => c.type === typeFilter)
  }, [categories, typeFilter])

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
      </div>
      <div className="flex gap-4 items-end flex-wrap">
        <div className="h-10 w-36 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-44 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-44 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm">Carregando</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        {!isVisualizador && <TransactionForm editTx={editTx} onEditDone={() => setEditTx(null)} />}
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={typeFilter || '__all__'} onValueChange={(v) => { setTypeFilter(v === '__all__' ? '' : v); setCategoryFilter('') }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
              <SelectItem value="TRANSFER">Transferências</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={categoryFilter || '__all__'} onValueChange={(v) => setCategoryFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {filteredCategories.map((c: { id: string; name: string; type: string }) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Período</Label>
          <PeriodSelector value={periodFilter} onChange={setPeriodFilter} />
        </div>
      </div>

      {!isError && (transactions.length > 0 || isLoading) && (
        <div className="flex gap-6 text-sm">
          <span>Receitas: <strong className="text-green-500">{formatCurrency(totals.income)}</strong></span>
          <span>Despesas: <strong className="text-red-500">{formatCurrency(totals.expense)}</strong></span>
          <span>Saldo: <strong className={totals.balance >= 0 ? 'text-green-500' : 'text-red-500'}>{formatCurrency(totals.balance)}</strong></span>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar transações</p>
          <p className="text-sm">Tente novamente mais tarde.</p>
        </div>
      )}

      {!isError && transactions.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-muted p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm">Nenhuma transação encontrada para os filtros selecionados.</p>
        </div>
      )}

      {!isError && transactions.length > 0 && <TransactionTable transactions={transactions} showActions={!isVisualizador} onEdit={setEditTx} />}
    </div>
  )
}
