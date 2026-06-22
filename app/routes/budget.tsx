import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PiggyBank, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { useBudgets, useCreateOrUpdateBudget, useDeleteBudget } from '@/features/finance/hooks/useBudgets'
import { useCategories } from '@/features/finance/hooks/useCategories'
import { useUserRole } from '@/features/auth/hooks/useUserRole'
import { formatCurrency } from '@/lib/utils'

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
})

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
})

type BudgetFormData = z.infer<typeof budgetFormSchema>

interface BudgetItem {
  id: string
  categoryId: string
  amount: number
  month: number
  year: number
  spent: number
  category: { id: string; name: string; color: string | null; type: string }
}

function BudgetDialog({
  open,
  onOpenChange,
  editBudget,
  month,
  year,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editBudget?: BudgetItem | null
  month: number
  year: number
}) {
  const createOrUpdate = useCreateOrUpdateBudget()
  const { data: categories } = useCategories()
  const isEditing = !!editBudget
  const expenseCategories = (categories as { id: string; name: string; type: string; color: string | null }[] | undefined)?.filter((c) => c.type === 'EXPENSE') ?? []

  const { handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: editBudget
      ? { categoryId: editBudget.categoryId, amount: editBudget.amount }
      : { categoryId: '', amount: undefined },
  })

  const onSubmit = async (data: BudgetFormData) => {
    try {
      await createOrUpdate.mutateAsync({ ...data, month, year })
      toast.success(isEditing ? 'Orçamento atualizado' : 'Orçamento criado')
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={watch('categoryId')}
              onValueChange={(v) => setValue('categoryId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={watch('amount') ?? ''}
              onChange={(e) => setValue('amount', e.target.value ? parseFloat(e.target.value) : 0)}
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Input value={month} disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input value={year} disabled className="opacity-60" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createOrUpdate.isPending}
          >
            {createOrUpdate.isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  item,
  open,
  onOpenChange,
}: {
  item: BudgetItem
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const deleteBudget = useDeleteBudget()

  const handleDelete = async () => {
    try {
      await deleteBudget.mutateAsync(item.id)
      toast.success('Orçamento excluído')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao excluir orçamento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Orçamento</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Excluir o orçamento de <strong>{item.category.name}</strong> para {String(item.month).padStart(2, '0')}/{item.year}?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteBudget.isPending}>
            {deleteBudget.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BudgetCard({
  item,
  onEdit,
  onDelete,
  isVisualizador,
}: {
  item: BudgetItem
  onEdit: () => void
  onDelete: () => void
  isVisualizador: boolean
}) {
  const pct = item.amount > 0 ? Math.min((item.spent / item.amount) * 100, 100) : 0
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'
  const textColor = item.spent > item.amount ? 'text-red-500' : 'text-muted-foreground'

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.category.color || '#3b82f6' }} />
          <span className="text-sm font-medium">{item.category.name}</span>
        </div>
        {!isVisualizador && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar orçamento ${item.category.name}`} onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Excluir orçamento ${item.category.name}`} onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex justify-between text-xs">
        <span className={textColor}>{formatCurrency(item.spent)} gastos</span>
        <span className="text-muted-foreground">{formatCurrency(item.amount)} orçado</span>
      </div>

      {pct >= 100 && (
        <p className="text-xs text-red-500 font-medium">Limite excedido</p>
      )}
      {pct >= 80 && pct < 100 && (
        <p className="text-xs text-yellow-600 font-medium">Próximo do limite</p>
      )}
    </Card>
  )
}

function BudgetPage() {
  const now = new Date()
  const [yearFilter, setYearFilter] = useState(now.getFullYear())
  const [monthFilter, setMonthFilter] = useState(now.getMonth() + 1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<BudgetItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BudgetItem | null>(null)

  const { data, isLoading, isError } = useBudgets(yearFilter, monthFilter)
  const { isVisualizador } = useUserRole()

  const budgets: BudgetItem[] = Array.isArray(data) ? data : []

  const openCreate = () => {
    setEditBudget(null)
    setDialogOpen(true)
  }

  const openEdit = (item: BudgetItem) => {
    setEditBudget(item)
    setDialogOpen(true)
  }

  const monthLabel = new Date(yearFilter, monthFilter - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PiggyBank className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Orçamentos</h1>
            <p className="text-sm text-muted-foreground capitalize">{monthLabel}</p>
          </div>
        </div>
        {!isVisualizador && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="space-y-2">
          <Label>Mês</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={monthFilter}
            onChange={(e) => setMonthFilter(parseInt(e.target.value) || 1)}
            className="w-20"
          />
        </div>
        <div className="space-y-2">
          <Label>Ano</Label>
          <Input
            type="number"
            min={2020}
            max={2099}
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value) || now.getFullYear())}
            className="w-24"
          />
        </div>
      </div>

      {isLoading && (
        <div className="p-12 text-center text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm">Carregando</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar orçamentos</p>
          <p className="text-sm">Tente novamente mais tarde.</p>
        </div>
      )}

      {!isLoading && !isError && budgets.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-muted p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">Nenhum orçamento para este período</p>
          <p className="text-sm">Clique em "Novo Orçamento" para começar.</p>
        </div>
      )}

      {!isLoading && !isError && budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((item) => (
            <BudgetCard
              key={item.id}
              item={item}
              onEdit={() => openEdit(item)}
              onDelete={() => setDeleteTarget(item)}
              isVisualizador={isVisualizador}
            />
          ))}
        </div>
      )}

      <BudgetDialog
        key={editBudget?.id ?? 'create'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editBudget={editBudget}
        month={monthFilter}
        year={yearFilter}
      />

      {deleteTarget && (
        <DeleteDialog
          item={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}
