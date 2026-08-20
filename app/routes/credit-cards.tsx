import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CreditCard, Plus, Trash2, ChevronDown, ChevronUp, Receipt } from 'lucide-react'
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
import { DatePicker } from '@/components/ui/date-picker'
import {
  useCreditCards,
  useCreateCreditCard,
  useDeleteCreditCard,
  useCreditCardInvoices,
  usePayInvoice,
} from '@/features/finance/hooks/useCreditCards'
import { useWallets } from '@/features/finance/hooks/useWallets'
import { useUserRole } from '@/features/auth/hooks/useUserRole'
import { formatCurrency, formatDate } from '@/lib/utils'

export const Route = createFileRoute('/credit-cards')({
  component: CreditCardsPage,
})

const dayRefine = (v: string | undefined) => !v || (parseInt(v) >= 1 && parseInt(v) <= 31)

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Máximo de 50 caracteres'),
  limit: z.string().optional(),
  closingDay: z.string().optional().refine(dayRefine, 'Deve ser entre 1 e 31'),
  billingDay: z.string().optional().refine(dayRefine, 'Deve ser entre 1 e 31'),
})

type FormData = z.infer<typeof formSchema>

interface CreditCardItem {
  id: string
  name: string
  limit: string | null
  closingDay: number | null
  billingDay: number | null
  used: number
  available: number | null
}

interface InvoiceTx {
  id: string
  amount: number
  description: string | null
  date: string
  installmentNumber: number | null
  totalInstallments: number | null
}

interface Invoice {
  month: number
  year: number
  total: number
  status: 'aberta' | 'fechada' | 'paga'
  transactions: InvoiceTx[]
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const STATUS_LABEL: Record<Invoice['status'], string> = { aberta: 'Aberta', fechada: 'Fechada', paga: 'Paga' }
const STATUS_CLASS: Record<Invoice['status'], string> = {
  aberta: 'bg-blue-100 text-blue-700',
  fechada: 'bg-yellow-100 text-yellow-700',
  paga: 'bg-green-100 text-green-700',
}

function NewCardDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const createCard = useCreateCreditCard()

  const { handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', limit: '', closingDay: '', billingDay: '' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const payload: Record<string, unknown> = { name: data.name }
      if (data.limit) payload.limit = parseFloat(data.limit.replace(',', '.'))
      if (data.closingDay) payload.closingDay = parseInt(data.closingDay)
      if (data.billingDay) payload.billingDay = parseInt(data.billingDay)

      await createCard.mutateAsync(payload)
      toast.success('Cartão criado com sucesso')
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
          <DialogTitle>Novo Cartão de Crédito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={watch('name') || ''}
              onChange={(e) => setValue('name', e.target.value)}
              placeholder="Ex: Nubank"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dia Fechamento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                placeholder="1"
                value={watch('closingDay') || ''}
                onChange={(e) => setValue('closingDay', e.target.value)}
              />
              {errors.closingDay && <p className="text-red-500 text-sm">{errors.closingDay.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Dia Vencimento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                placeholder="15"
                value={watch('billingDay') || ''}
                onChange={(e) => setValue('billingDay', e.target.value)}
              />
              {errors.billingDay && <p className="text-red-500 text-sm">{errors.billingDay.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Limite</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="5.000,00"
              value={watch('limit') || ''}
              onChange={(e) => setValue('limit', e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={createCard.isPending}>
            {createCard.isPending ? 'Salvando...' : 'Criar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  card,
  open,
  onOpenChange,
}: {
  card: CreditCardItem
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const deleteCard = useDeleteCreditCard()

  const handleDelete = async () => {
    try {
      await deleteCard.mutateAsync(card.id)
      toast.success('Cartão excluído com sucesso')
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
          <DialogTitle>Excluir Cartão</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Excluir o cartão <strong>{card.name}</strong> removerá a referência nas transações existentes.
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteCard.isPending}>
            {deleteCard.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PayInvoiceDialog({
  cardId,
  cardName,
  invoice,
  open,
  onOpenChange,
}: {
  cardId: string
  cardName: string
  invoice: Invoice
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const payInvoice = usePayInvoice()
  const { data: walletsData } = useWallets()
  const walletList = (Array.isArray(walletsData) ? walletsData : []) as { id: string; name: string }[]
  const [walletId, setWalletId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const handlePay = async () => {
    if (!walletId) {
      toast.error('Selecione a conta de pagamento')
      return
    }
    try {
      const result = await payInvoice.mutateAsync({
        cardId,
        month: invoice.month,
        year: invoice.year,
        walletId,
        date,
      })
      toast.success(`Fatura paga: ${result.paidCount} transaç${result.paidCount > 1 ? 'ões' : 'ão'} quitada${result.paidCount > 1 ? 's' : ''}`)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao pagar fatura')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar Fatura - {cardName} {String(invoice.month).padStart(2, '0')}/{invoice.year}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Isso vai lançar um único débito de <strong>{formatCurrency(invoice.total)}</strong> na
            conta escolhida e marcar as {invoice.transactions.length} transações dessa fatura como pagas.
          </p>
          <div className="space-y-2">
            <Label>Conta de pagamento</Label>
            <Select value={walletId} onValueChange={setWalletId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {walletList.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data do pagamento</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>
          <Button className="w-full" onClick={handlePay} disabled={payInvoice.isPending}>
            {payInvoice.isPending ? 'Pagando...' : 'Confirmar Pagamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CardInvoices({ card, isVisualizador }: { card: CreditCardItem; isVisualizador: boolean }) {
  const { data, isLoading } = useCreditCardInvoices(card.id)
  const [payTarget, setPayTarget] = useState<Invoice | null>(null)
  const invoices: Invoice[] = data?.invoices ?? []

  if (isLoading) {
    return <p className="text-xs text-muted-foreground p-3">Carregando faturas...</p>
  }

  if (invoices.length === 0) {
    return <p className="text-xs text-muted-foreground p-3">Nenhuma compra lançada neste cartão ainda.</p>
  }

  return (
    <div className="space-y-3 p-3 pt-0">
      {[...invoices].reverse().map((inv) => (
        <div key={`${inv.year}-${inv.month}`} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{MONTH_NAMES[inv.month - 1]}/{inv.year}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLASS[inv.status]}`}>{STATUS_LABEL[inv.status]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{formatCurrency(inv.total)}</span>
              {!isVisualizador && inv.status === 'fechada' && (
                <Button size="sm" variant="outline" onClick={() => setPayTarget(inv)}>
                  Pagar fatura
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {inv.transactions.map((t) => (
              <div key={t.id} className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatDate(t.date)} — {t.description || 'Sem descrição'}
                  {t.totalInstallments && t.totalInstallments > 1 ? ` (${t.installmentNumber}/${t.totalInstallments})` : ''}
                </span>
                <span>{formatCurrency(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {payTarget && (
        <PayInvoiceDialog
          cardId={card.id}
          cardName={card.name}
          invoice={payTarget}
          open={!!payTarget}
          onOpenChange={(o) => { if (!o) setPayTarget(null) }}
        />
      )}
    </div>
  )
}

function formatCurrencyOrNull(value: string | number | null) {
  if (value === null || value === undefined) return null
  const num = typeof value === 'string' ? parseFloat(value) : value
  return formatCurrency(num)
}

function CreditCardsPage() {
  const { data: cards, isLoading, isError } = useCreditCards()
  const { isVisualizador } = useUserRole()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CreditCardItem | null>(null)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Cartões de Crédito</h1>
            <p className="text-sm text-muted-foreground">Gerencie os cartões e as faturas</p>
          </div>
        </div>
        {!isVisualizador && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
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
          <p className="text-lg font-medium">Erro ao carregar cartões</p>
          <p className="text-sm">Tente novamente mais tarde.</p>
        </div>
      )}

      {!isLoading && !isError && (!cards || cards.length === 0) && (
        <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum cartão cadastrado</p>
          <p className="text-sm">Adicione seu primeiro cartão de crédito.</p>
        </div>
      )}

      {!isLoading && !isError && cards && cards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(cards as CreditCardItem[]).map((card) => {
            const expanded = expandedCardId === card.id
            return (
              <Card key={card.id} className="overflow-hidden">
                <div
                  className="p-4 space-y-3 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => setExpandedCardId(expanded ? null : card.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-semibold">{card.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isVisualizador && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(card) }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {card.closingDay && <p>Fecha dia {card.closingDay}</p>}
                    {card.billingDay && <p>Vence dia {card.billingDay}</p>}
                    {card.limit != null && (
                      <>
                        <p className="text-foreground font-medium">Limite: {formatCurrencyOrNull(card.limit)}</p>
                        <p>
                          Disponível: <span className={card.available != null && card.available < 0 ? 'text-red-500 font-medium' : 'text-foreground font-medium'}>
                            {formatCurrencyOrNull(card.available)}
                          </span>
                        </p>
                      </>
                    )}
                    {card.used > 0 && card.limit == null && (
                      <p>Em aberto: <span className="text-foreground font-medium">{formatCurrency(card.used)}</span></p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>{expanded ? 'Ocultar faturas' : 'Ver faturas'}</span>
                  </div>
                </div>
                {expanded && <CardInvoices card={card} isVisualizador={isVisualizador} />}
              </Card>
            )
          })}
        </div>
      )}

      <NewCardDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {deleteTarget && (
        <DeleteDialog
          card={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}
