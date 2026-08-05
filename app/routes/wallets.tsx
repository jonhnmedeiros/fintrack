import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Wallet as WalletIcon, Plus, Pencil, Trash2, Landmark, PiggyBank, TrendingUp, Banknote } from 'lucide-react'
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
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from '@/features/finance/hooks/useWallets'
import { useUserRole } from '@/features/auth/hooks/useUserRole'
import { formatCurrency } from '@/lib/utils'

export const Route = createFileRoute('/wallets')({
  component: WalletsPage,
})

const WALLET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16',
]

const randomColor = () => WALLET_COLORS[Math.floor(Math.random() * WALLET_COLORS.length)]

const WALLET_TYPE_LABEL: Record<string, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  INVESTMENT: 'Investimentos',
  CASH: 'Dinheiro',
  OTHER: 'Outro',
}

const WALLET_TYPE_ICON: Record<string, typeof WalletIcon> = {
  CHECKING: Landmark,
  SAVINGS: PiggyBank,
  INVESTMENT: TrendingUp,
  CASH: Banknote,
  OTHER: WalletIcon,
}

const walletFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Máximo de 50 caracteres'),
  type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER'], { message: 'Selecione o tipo' }),
  color: z.string().optional(),
})

type WalletFormData = z.infer<typeof walletFormSchema>

interface WalletItem {
  id: string
  name: string
  type: string
  color: string | null
  icon: string | null
  balance: number
}

function WalletDialog({
  open,
  onOpenChange,
  editWallet,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editWallet?: WalletItem | null
}) {
  const createWallet = useCreateWallet()
  const updateWallet = useUpdateWallet()
  const isEditing = !!editWallet

  const { handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<WalletFormData>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: { name: '', type: undefined as unknown as WalletFormData['type'], color: randomColor() },
  })

  // Preenche o formulário quando o dialog abre — para edição, com os dados
  // da conta; para criação, em branco. Usar `reset()` (em vez de `values`)
  // evita recomputar/resetar o formulário a cada re-render (ex: cada tecla
  // digitada), que apagava o que o usuário acabara de escrever.
  useEffect(() => {
    if (!open) return
    if (editWallet) {
      reset({ name: editWallet.name, type: editWallet.type as WalletFormData['type'], color: editWallet.color || randomColor() })
    } else {
      reset({ name: '', type: undefined as unknown as WalletFormData['type'], color: randomColor() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editWallet?.id])

  const onSubmit = async (data: WalletFormData) => {
    try {
      if (isEditing) {
        await updateWallet.mutateAsync({ id: editWallet.id, ...data })
        toast.success('Conta atualizada com sucesso')
      } else {
        await createWallet.mutateAsync(data)
        toast.success('Conta criada com sucesso')
      }
      reset()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={watch('name') || ''}
              onChange={(e) => setValue('name', e.target.value)}
              placeholder="Ex: Nubank, Carteira"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={watch('type') || ''} onValueChange={(v) => setValue('type', v as WalletFormData['type'])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">Conta Corrente</SelectItem>
                <SelectItem value="SAVINGS">Poupança</SelectItem>
                <SelectItem value="INVESTMENT">Investimentos</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {WALLET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-7 w-7 rounded-full border-2"
                  style={{ backgroundColor: color, borderColor: watch('color') === color ? '#000' : 'transparent' }}
                  onClick={() => setValue('color', color)}
                />
              ))}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createWallet.isPending || updateWallet.isPending}
          >
            {createWallet.isPending || updateWallet.isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  wallet,
  open,
  onOpenChange,
}: {
  wallet: WalletItem
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const deleteWallet = useDeleteWallet()

  const handleDelete = async () => {
    try {
      await deleteWallet.mutateAsync(wallet.id)
      toast.success('Conta excluída com sucesso')
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Conta</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Excluir a conta <strong>{wallet.name}</strong>? Só é possível excluir contas sem
          transações vinculadas. Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteWallet.isPending}>
            {deleteWallet.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WalletsPage() {
  const { data: wallets, isLoading, isError } = useWallets()
  const { isVisualizador } = useUserRole()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editWallet, setEditWallet] = useState<WalletItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WalletItem | null>(null)

  const walletList: WalletItem[] = Array.isArray(wallets) ? wallets : []

  const openCreate = () => {
    setEditWallet(null)
    setDialogOpen(true)
  }

  const openEdit = (wallet: WalletItem) => {
    setEditWallet(wallet)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <WalletIcon className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Contas</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas contas e carteiras</p>
          </div>
        </div>
        {!isVisualizador && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="p-12 text-center text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm">Carregando</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar contas</p>
          <p className="text-sm">Tente novamente mais tarde.</p>
        </div>
      )}

      {!isLoading && !isError && walletList.length === 0 && (
        <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
          <WalletIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma conta cadastrada</p>
          <p className="text-sm">Adicione sua primeira conta ou carteira.</p>
        </div>
      )}

      {!isLoading && !isError && walletList.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {walletList.map((wallet) => {
            const Icon = WALLET_TYPE_ICON[wallet.type] || WalletIcon
            return (
              <Card key={wallet.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${wallet.color || '#3b82f6'}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: wallet.color || '#3b82f6' }} />
                    </div>
                    <div>
                      <span className="font-semibold block">{wallet.name}</span>
                      <span className="text-xs text-muted-foreground">{WALLET_TYPE_LABEL[wallet.type] || wallet.type}</span>
                    </div>
                  </div>
                  {!isVisualizador && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar conta ${wallet.name}`} onClick={() => openEdit(wallet)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Excluir conta ${wallet.name}`} onClick={() => setDeleteTarget(wallet)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className={`text-xl font-bold ${wallet.balance >= 0 ? '' : 'text-red-500'}`}>
                  {formatCurrency(wallet.balance)}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      <WalletDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditWallet(null) }}
        editWallet={editWallet}
      />

      {deleteTarget && (
        <DeleteDialog
          wallet={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}
