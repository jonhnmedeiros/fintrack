import { useState, useEffect } from 'react'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions'
import { useCategories, useCreateCategory } from '../hooks/useCategories'
import { useCreditCards } from '../hooks/useCreditCards'
import { Plus, Smile } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16',
  '#f43f5e', '#d946ef', '#0ea5e9', '#10b981', '#f59e0b',
]

const EMOJI_CATEGORIES = [
  { label: '🍕', name: 'Comida', emojis: ['🍕','🛒','🥡','🍔','🌮','🥗','🍣','🍜','🍝','🍰','🍩','🍪','🍫','🍿','🥤','☕','🍺','🍷','🥂','🧊'] },
  { label: '🏠', name: 'Casa', emojis: ['🏠','💡','📡','🔧','🪴','🖼️','🛋️','🚿','🛁','🧹','🔑','🔒','🗝️','🧰','🪣'] },
  { label: '🚗', name: 'Transporte', emojis: ['🚗','🚌','⛽','🚕','🚙','🚐','🏍️','✈️','🚂','🚢','🛴','🅿️','🚲','🛵','🚁','🚀'] },
  { label: '🎬', name: 'Lazer', emojis: ['🎬','🎮','🎯','🎪','🎭','🎨','🎵','🎸','🎹','🎧','📷','🎥','🎤','🎼','🎲'] },
  { label: '👕', name: 'Roupas', emojis: ['👕','👗','👔','👟','👠','👒','👜','💼','🧢','👖','👙','👘','🧤','🧣','👞'] },
  { label: '💊', name: 'Saúde', emojis: ['💊','🏥','💉','🩺','❤️','💪','🦷','👁️','🧠','🫀','🩸','🦴','👂','👃'] },
  { label: '🐾', name: 'Natureza', emojis: ['🐾','🐶','🐱','🐼','🐸','🦊','🐻','🐨','🐝','🌻','🌸','🌺','🌿','🌵','🍀','🐟','🐠','🦋','🐞'] },
  { label: '💻', name: 'Tecnologia', emojis: ['💻','📱','🖥️','⌚','📸','🎧','🕹️','⌨️','🖱️','📀','💾','📷','📹','☎️'] },
  { label: '🏋️', name: 'Esportes', emojis: ['🏋️','⚽','🏀','⚾','🎾','🏐','🏓','⛳','🏄','🚴','🥊','🤸','🎿','🏊','🤿'] },
  { label: '✈️', name: 'Viagem', emojis: ['✈️','🗺️','🧳','🏖️','🏔️','🏝️','🗽','🗼','⛺','🌋','🏯','🎡','🏰','🌉'] },
  { label: '💰', name: 'Finanças', emojis: ['💰','💳','💵','💴','💶','💷','💎','📊','📈','💹','🏦','🧾','📉'] },
  { label: '🎁', name: 'Objetos', emojis: ['🎁','🎉','🎊','🎀','📚','✏️','📌','🕐','📅','📋','✂️','📎','📮','📦','🎈'] },
]

const randomColor = () => CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]

function EmojiGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = useState(0)
  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 overflow-x-auto pb-1 border-b">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <Button
            key={cat.name}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTab(i)}
            className={tab === i ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground'}
            title={cat.name}
          >
            {cat.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {EMOJI_CATEGORIES[tab].emojis.map(emoji => (
          <Button
            key={emoji}
            type="button"
            variant={value === emoji ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onChange(value === emoji ? '' : emoji)}
            className="text-lg rounded-lg"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}

const DAY = new Date().toISOString().split('T')[0]

type TransactionForm = z.infer<typeof createTransactionSchema>

interface EditTransaction {
  id: string
  type: string
  amount: number
  description: string | null
  date: string
  categoryId: string | null
  creditCardId: string | null
  installmentNumber: number | null
  totalInstallments: number | null
}

interface TransactionFormProps {
  editTx?: EditTransaction | null
  onEditDone?: () => void
}

export function TransactionForm({ editTx, onEditDone }: TransactionFormProps) {
  const isEditing = !!editTx
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [pendingClose, setPendingClose] = useState(false)
  const { handleSubmit, formState: { errors, isDirty }, watch, reset, setValue } = useForm<TransactionForm>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { date: DAY },
  })

  const [prevEditId, setPrevEditId] = useState<string | null>(null)

  useEffect(() => {
    if (editTx?.id && editTx.id !== prevEditId) {
      setPrevEditId(editTx.id)
      setOpen(true)
      setFormKey(k => k + 1)
      reset({
        type: editTx.type as TransactionForm['type'],
        amount: editTx.amount,
        description: editTx.description || '',
        date: editTx.date.split('T')[0],
        categoryId: editTx.categoryId || '',
        creditCardId: editTx.creditCardId || '',
        totalInstallments: editTx.totalInstallments || undefined,
      })
      setAmountDisplay(Number(editTx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
      setValue('amount', Number(editTx.amount))
    }
    if (!editTx) {
      setPrevEditId(null)
    }
  }, [editTx])

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const { data: categories, isError: catError } = useCategories()
  const { data: creditCards, isError: ccError } = useCreditCards()

  const createCategory = useCreateCategory()
  const queryClient = useQueryClient()
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('')
  const [newCatParentId, setNewCatParentId] = useState('')
  const [newCatColor, setNewCatColor] = useState(randomColor())
  const [amountDisplay, setAmountDisplay] = useState('')

  const type = watch('type')
  const creditCardId = watch('creditCardId')

  const parentCategories = !type ? [] : (categories as any[] | undefined)?.filter(
    (c: any) => c.type === type && !c.parentId
  ) ?? []

  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !type) return
    try {
      const payload: Record<string, unknown> = {
        name: newCatName.trim(),
        type: type === 'TRANSFER' ? 'EXPENSE' : type,
        color: newCatColor,
      }
      if (newCatIcon) payload.icon = newCatIcon
      if (newCatParentId) payload.parentId = newCatParentId

      const cat = await createCategory.mutateAsync(payload)
      const catId = (cat as { id: string }).id
      await queryClient.refetchQueries({ queryKey: ['categories'] })
      setValue('categoryId', catId)
      setShowNewCategory(false)
      setNewCatName('')
      setNewCatIcon('')
      setNewCatParentId('')
      setNewCatColor(randomColor())
      toast.success('Categoria criada')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar categoria'
      toast.error(message)
    }
  }

  const resetNewCategory = () => {
    setNewCatName('')
    setNewCatIcon('')
    setNewCatParentId('')
    setNewCatColor(randomColor())
  }

  const onSubmit = async (data: TransactionForm) => {
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
        creditCardId: data.creditCardId || undefined,
        totalInstallments: data.totalInstallments || undefined,
        amount: Number(data.amount),
      }
      if (isEditing) {
        await updateMutation.mutateAsync({ id: editTx.id, data: payload })
        toast.success('Transação atualizada com sucesso')
        setOpen(false)
        setAmountDisplay('')
        onEditDone?.()
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Transação criada com sucesso')
        reset()
        setValue('date', DAY)
        setOpen(false)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast.error(message)
    }
  }

  const allCategories = !type ? [] : (categories as any[] | undefined)?.filter(
    (c) => type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  ) ?? []

  const parentMap = new Map<string, { parent: { id: string; name: string; icon?: string }; children: { id: string; name: string; icon?: string }[] }>()
  for (const cat of allCategories) {
    if (!cat.parentId) {
      parentMap.set(cat.id, { parent: cat, children: [] })
    }
  }
  for (const cat of allCategories) {
    if (cat.parentId) {
      const group = parentMap.get(cat.parentId)
      if (group) group.children.push(cat)
    }
  }
  const grouped = Array.from(parentMap.values())

  const doClose = () => {
    setOpen(false)
    if (isEditing) onEditDone?.()
    setAmountDisplay('')
    setPendingClose(false)
  }

  return (
    <Dialog open={isEditing ? open : open} onOpenChange={(v) => {
      if (v) {
        if (isEditing) setOpen(true)
        else { setOpen(true); setFormKey(k => k + 1) }
      } else if (isDirty) {
        setPendingClose(true)
      } else {
        doClose()
      }
    }}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </DialogTrigger>
      )}
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </DialogTrigger>
      )}
      <DialogContent key={formKey} className="relative">
        {pendingClose && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="bg-popover p-6 rounded-lg border shadow-lg space-y-4 mx-4">
              <p className="text-sm font-medium">Descartar alterações?</p>
              <p className="text-sm text-muted-foreground">As alterações não salvas serão perdidas.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setPendingClose(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={doClose}>Descartar</Button>
              </div>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
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
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amountDisplay}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d,]/g, '')
                const parts = raw.split(',')
                const cleaned = parts[0] + (parts.length > 1 ? ',' + parts.slice(1).join('') : '')
                setAmountDisplay(cleaned)
                setValue('amount', parseFloat(cleaned.replace(',', '.')) || 0)
              }}
              onFocus={() => {
                const val = watch('amount')
                setAmountDisplay(val != null ? String(val).replace('.', ',') : '')
              }}
              onBlur={() => {
                const val = watch('amount')
                setAmountDisplay(val != null ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '')
              }}
            />
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
                    {grouped.filter(g => g.children.length > 0).length === 0 ? (
                      <SelectItem value="__no_category__" disabled>
                        Nenhuma categoria disponível
                      </SelectItem>
                    ) : grouped.map(group => group.children.length > 0 && (
                      <SelectGroup key={group.parent.id}>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                          {group.parent.icon ? `${group.parent.icon} ` : ''}{group.parent.name}
                        </SelectLabel>
                        {group.children.map(child => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.icon ? `${child.icon} ` : ''}{child.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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

          <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </form>

        <Dialog open={showNewCategory} onOpenChange={(v) => { if (!v) resetNewCategory(); setShowNewCategory(v) }}>
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

              <div className="space-y-2">
                <Label>Categoria pai (opcional)</Label>
                <Select value={newCatParentId} onValueChange={(v) => setNewCatParentId(v === '__none__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Nenhuma — criar categoria principal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {parentCategories.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ícone (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                      {newCatIcon ? (
                        <span className="text-lg">{newCatIcon}</span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Smile className="h-4 w-4" /> Selecione
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <EmojiGrid value={newCatIcon} onChange={setNewCatIcon} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewCatColor(color)}
                      className={`h-7 w-7 rounded-full border-2 p-0 ${
                        newCatColor === color
                          ? 'border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/30'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
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
