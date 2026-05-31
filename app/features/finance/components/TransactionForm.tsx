import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { createTransactionSchema } from '../schemas'
import { useCreateTransaction } from '../hooks/useTransactions'
import { useCategories, useCreateCategory } from '../hooks/useCategories'
import { useCreditCards } from '../hooks/useCreditCards'
import { Plus } from 'lucide-react'

const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16',
  '#f43f5e', '#d946ef', '#0ea5e9', '#10b981', '#f59e0b',
]

const randomColor = () => CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]

const DAY = new Date().toISOString().split('T')[0]

type TransactionForm = z.infer<typeof createTransactionSchema>

export function TransactionForm() {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const { handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<TransactionForm>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { date: DAY },
  })

  const createMutation = useCreateTransaction()
  const { data: categories, isError: catError } = useCategories()
  const { data: creditCards, isError: ccError } = useCreditCards()

  const createCategory = useCreateCategory()
  const queryClient = useQueryClient()
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const type = watch('type')
  const creditCardId = watch('creditCardId')

  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !type) return
    try {
      const cat = await createCategory.mutateAsync({
        name: newCatName.trim(),
        type,
        color: randomColor(),
      })
      const catId = (cat as { id: string }).id
      await queryClient.refetchQueries({ queryKey: ['categories'] })
      setValue('categoryId', catId)
      setShowNewCategory(false)
      setNewCatName('')
      toast.success('Categoria criada')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar categoria'
      toast.error(message)
    }
  }

  const onSubmit = async (data: TransactionForm) => {
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
        creditCardId: data.creditCardId || undefined,
        totalInstallments: data.totalInstallments || undefined,
        amount: data.amount,
      }
      await createMutation.mutateAsync(payload)
      toast.success('Transação criada com sucesso')
      reset()
      setValue('date', DAY)
      setOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast.error(message)
    }
  }

  const filteredCategories = !type ? [] : categories?.filter((c: { type: string }) =>
    type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  )

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setFormKey(k => k + 1) }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent key={formKey}>
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={watch('type') || ''} onValueChange={(v) => setValue('type', v as any)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Receita</SelectItem>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
                <SelectItem value="TRANSFER">Transferência</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Valor</Label>
            <Input type="number" step="0.01" placeholder="0,00" onChange={(e) => setValue('amount', parseFloat(e.target.value.replace(/\./g, '').replace(',', '.')) || 0)} value={watch('amount') ?? ''} />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={watch('description') || ''} onChange={(e) => setValue('description', e.target.value)} placeholder="Descrição da transação" />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            {catError && <p className="text-red-500 text-xs">Erro ao carregar categorias</p>}
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={watch('categoryId') || ''} onValueChange={(v) => setValue('categoryId', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories?.map((c: { id: string; name: string }) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {type && (
                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewCategory(true)} title="Nova categoria" className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" value={watch('date') || ''} onChange={(e) => setValue('date', e.target.value)} />
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
          </div>

          {type === 'EXPENSE' && (
            <>
              <div className="space-y-2">
                <Label>Cartão de Crédito</Label>
                {ccError && <p className="text-red-500 text-xs">Erro ao carregar cartões</p>}
                <Select value={watch('creditCardId') || '__none__'} onValueChange={(v) => setValue('creditCardId', v === '__none__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    {creditCards?.map((c: { id: string; name: string }) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {creditCardId && (
                <div className="space-y-2">
                  <Label>Parcelas</Label>
                  <Input type="number" min="1" max="48" placeholder="1" value={watch('totalInstallments') ?? ''} onChange={(e) => setValue('totalInstallments', isNaN(parseInt(e.target.value)) ? undefined : parseInt(e.target.value))} />
                  {errors.totalInstallments && <p className="text-red-500 text-sm">{errors.totalInstallments.message}</p>}
                </div>
              )}
            </>
          )}

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>

        <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nome da categoria"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory() } }}
                />
              </div>
              <Button type="button" className="w-full" onClick={handleCreateCategory} disabled={!newCatName.trim() || createCategory.isPending}>
                {createCategory.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
