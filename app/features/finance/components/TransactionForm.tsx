import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { useCreateTransaction } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useCreditCards } from '../hooks/useCreditCards'
import { Plus } from 'lucide-react'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string(),
  creditCardId: z.string().optional(),
  totalInstallments: z.number().int().min(1).optional(),
})

type TransactionForm = z.infer<typeof transactionSchema>

export function TransactionForm() {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  const createMutation = useCreateTransaction()
  const { data: categories } = useCategories()
  const { data: creditCards } = useCreditCards()

  const type = watch('type')
  const creditCardId = watch('creditCardId')

  const onSubmit = async (data: TransactionForm) => {
    await createMutation.mutateAsync(data)
    reset()
  }

  const filteredCategories = categories?.filter((c: { type: string }) =>
    type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <Select onValueChange={(v) => register('type').onChange({ target: { value: v } })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Receita</SelectItem>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
                <SelectItem value="TRANSFER">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor</Label>
            <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>
          <div>
            <Label>Descrição</Label>
            <Input {...register('description')} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select onValueChange={(v) => register('categoryId').onChange({ target: { value: v } })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {filteredCategories?.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" {...register('date')} />
          </div>
          {type === 'EXPENSE' && (
            <>
              <div>
                <Label>Cartão de Crédito</Label>
                <Select onValueChange={(v) => register('creditCardId').onChange({ target: { value: v } })}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {creditCards?.map((c: { id: string; name: string }) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {creditCardId && (
                <div>
                  <Label>Parcelas</Label>
                  <Input type="number" min="1" max="48" {...register('totalInstallments', { valueAsNumber: true })} />
                </div>
              )}
            </>
          )}
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
