import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { TransactionTable } from '@/features/finance/components/TransactionTable'
import { TransactionForm } from '@/features/finance/components/TransactionForm'
import { useTransactions } from '@/features/finance/hooks/useTransactions'
import { useCategories } from '@/features/finance/hooks/useCategories'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [monthFilter, setMonthFilter] = useState('')

  const filters: Record<string, string | undefined> = {}
  if (typeFilter && typeFilter !== '__all__') filters.type = typeFilter
  if (categoryFilter && categoryFilter !== '__all__') filters.categoryId = categoryFilter
  if (monthFilter) {
    const [year, month] = monthFilter.split('-')
    const startDate = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month}-${lastDay}`
    filters.startDate = startDate
    filters.endDate = endDate
  }

  const { data, isLoading } = useTransactions(filters)
  const { data: categories } = useCategories()

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <TransactionForm />
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={typeFilter || '__all__'} onValueChange={(v) => setTypeFilter(v === '__all__' ? '' : v)}>
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
              {categories?.map((c: { id: string; name: string; type: string }) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Mês</Label>
          <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-44" />
        </div>
      </div>

      <TransactionTable transactions={data || []} />
    </div>
  )
}
