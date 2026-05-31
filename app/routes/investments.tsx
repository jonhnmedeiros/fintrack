import { useState, useMemo, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TrendingUp, Plus, Trash2, Receipt, Bell, Upload, Download, PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAssets, useCreateAsset, useDeleteAsset } from '@/features/investments/hooks/useAssets'
import { useInvestmentTransactions, useCreateInvestmentTransaction, useDeleteInvestmentTransaction } from '@/features/investments/hooks/useInvestmentTransactions'
import { useAlerts, useCreateAlert, useDeleteAlert } from '@/features/investments/hooks/useAlerts'
import { BrokerNoteUpload } from '@/features/investments/components/BrokerNoteUpload'
import { ProfitChart } from '@/features/investments/components/ProfitChart'
import { useUserRole } from '@/features/auth/hooks/useUserRole'
import { formatCurrency, formatDate } from '@/lib/utils'

export const Route = createFileRoute('/investments')({
  component: InvestmentsPage,
})

const ALLOCATION_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#f59e0b', '#8b5cf6', '#ec4899']
const TYPE_LABELS: Record<string, string> = { STOCK: 'Ações', ETF: 'ETFs', CRYPTO: 'Cripto', FIIS: 'FIIs', BOND: 'Renda Fixa', OTHER: 'Outros' }

const ASSET_TYPES = ['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'OTHER'] as const

const assetFormSchema = z.object({
  ticker: z.string().min(1, 'Ticker é obrigatório').max(20).toUpperCase(),
  name: z.string().optional(),
  type: z.enum(['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'OTHER']),
  market: z.string().optional(),
})

type AssetFormData = z.infer<typeof assetFormSchema>

const transactionFormSchema = z.object({
  type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'TAX']),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  price: z.number().positive('Preço deve ser positivo'),
  fees: z.number().optional(),
  taxes: z.number().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
})

type TransactionFormData = z.infer<typeof transactionFormSchema>

interface AssetTx {
  id: string
  type: string
  quantity: number
  price: number
  fees: number | null
  taxes: number | null
  date: string
}

interface AssetItem {
  id: string
  ticker: string
  name: string | null
  type: string
  market: string | null
  transactions: AssetTx[]
}

function calcPosition(transactions: AssetTx[]) {
  let totalQuantity = 0
  let totalCost = 0
  for (const tx of transactions) {
    const qty = Number(tx.quantity)
    const price = Number(tx.price)
    if (tx.type === 'BUY') {
      totalQuantity += qty
      totalCost += qty * price
    } else if (tx.type === 'SELL') {
      const avg = totalQuantity > 0 ? totalCost / totalQuantity : 0
      totalCost -= qty * avg
      totalQuantity -= qty
    }
  }
  const avgPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0
  return { quantity: totalQuantity, avgPrice, invested: totalQuantity * avgPrice }
}

function CreateAssetDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const createAsset = useCreateAsset()
  const { handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: { ticker: '', name: '', type: undefined, market: '' },
  })

  const onSubmit = async (data: AssetFormData) => {
    try {
      await createAsset.mutateAsync(data)
      toast.success('Ativo criado com sucesso')
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Ativo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Ticker</Label>
            <Input
              value={watch('ticker')}
              onChange={(e) => setValue('ticker', e.target.value.toUpperCase())}
              placeholder="Ex: PETR4"
            />
            {errors.ticker && <p className="text-red-500 text-sm">{errors.ticker.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Nome (opcional)</Label>
            <Input
              value={watch('name') || ''}
              onChange={(e) => setValue('name', e.target.value)}
              placeholder="Ex: Petrobras"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={watch('type') || ''} onValueChange={(v) => setValue('type', v as AssetFormData['type'])}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Mercado (opcional)</Label>
            <Input
              value={watch('market') || ''}
              onChange={(e) => setValue('market', e.target.value)}
              placeholder="Ex: BOVESPA"
            />
          </div>
          <Button type="submit" className="w-full" disabled={createAsset.isPending}>
            {createAsset.isPending ? 'Salvando...' : 'Criar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TransactionDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: AssetItem
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const createTx = useCreateInvestmentTransaction()
  const { handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: { type: undefined, quantity: undefined, price: undefined, fees: 0, taxes: 0, date: new Date().toISOString().slice(0, 10) },
  })

  const onSubmit = async (data: TransactionFormData) => {
    try {
      await createTx.mutateAsync({ ...data, fees: data.fees || 0, taxes: data.taxes || 0, assetId: asset.id })
      toast.success('Transação registrada')
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Transação - {asset.ticker}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={watch('type') || ''} onValueChange={(v) => setValue('type', v as TransactionFormData['type'])}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">Compra</SelectItem>
                <SelectItem value="SELL">Venda</SelectItem>
                <SelectItem value="DIVIDEND">Dividendo</SelectItem>
                <SelectItem value="TAX">Taxa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" step="1" min="0" placeholder="100"
                value={watch('quantity') ?? ''}
                onChange={(e) => setValue('quantity', e.target.value ? parseFloat(e.target.value) : 0)}
              />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input type="number" step="0.01" min="0" placeholder="25.50"
                value={watch('price') ?? ''}
                onChange={(e) => setValue('price', e.target.value ? parseFloat(e.target.value) : 0)}
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Taxas</Label>
              <Input type="number" step="0.01" min="0" placeholder="0"
                value={watch('fees') ?? 0}
                onChange={(e) => setValue('fees', e.target.value ? parseFloat(e.target.value) : 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos</Label>
              <Input type="number" step="0.01" min="0" placeholder="0"
                value={watch('taxes') ?? 0}
                onChange={(e) => setValue('taxes', e.target.value ? parseFloat(e.target.value) : 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date"
              value={watch('date')}
              onChange={(e) => setValue('date', e.target.value)}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={createTx.isPending}>
            {createTx.isPending ? 'Salvando...' : 'Registrar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AlertsDialog({
  asset,
  open,
  onOpenChange,
  isVisualizador: viz,
}: {
  asset: AssetItem
  open: boolean
  onOpenChange: (v: boolean) => void
  isVisualizador: boolean
}) {
  const { data: alertsData, isLoading: alertsLoading } = useAlerts()
  const createAlert = useCreateAlert()
  const deleteAlert = useDeleteAlert()
  const [form, setForm] = useState({ type: 'PRICE', targetPrice: '', message: '' })

  const assetAlerts = (Array.isArray(alertsData) ? alertsData : []).filter(
    (a: { assetId: string }) => a.assetId === asset.id
  )

  const handleCreate = async () => {
    if (!form.targetPrice && form.type === 'PRICE') {
      toast.error('Preço alvo é obrigatório')
      return
    }
    try {
      await createAlert.mutateAsync({
        type: form.type,
        targetPrice: form.targetPrice ? parseFloat(form.targetPrice) : undefined,
        message: form.message || `Alerta de ${form.type} para ${asset.ticker}`,
        assetId: asset.id,
      })
      toast.success('Alerta criado')
      setForm({ type: 'PRICE', targetPrice: '', message: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar alerta')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert.mutateAsync(id)
      toast.success('Alerta excluído')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir alerta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Alertas - {asset.ticker}</DialogTitle></DialogHeader>

        {!viz && (
          <div className="space-y-3 pb-4 border-b">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRICE">Preço</SelectItem>
                  <SelectItem value="VOLUME">Volume</SelectItem>
                  <SelectItem value="DIVIDEND">Dividendo</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === 'PRICE' && (
              <div className="space-y-2">
                <Label>Preço alvo</Label>
                <Input type="number" step="0.01" placeholder="25.50" value={form.targetPrice}
                  onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} />
              </div>
            )}
            <Button size="sm" onClick={handleCreate} disabled={createAlert.isPending}>
              {createAlert.isPending ? 'Criando...' : 'Criar Alerta'}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Alertas ativos ({alertsLoading ? '...' : assetAlerts.length})</p>
          {alertsLoading && (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          )}
          {!alertsLoading && assetAlerts.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum alerta configurado</p>
          )}
          {!alertsLoading && assetAlerts.length > 0 && assetAlerts.map((alert: { id: string; type: string; targetPrice: number | null; message: string }) => (
            <div key={alert.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
              <div>
                <span className="font-medium">{alert.type === 'PRICE' ? 'Preço' : alert.type === 'VOLUME' ? 'Volume' : alert.type === 'DIVIDEND' ? 'Dividendo' : alert.type}</span>
                {alert.targetPrice && <span className="ml-2 text-muted-foreground">{formatCurrency(alert.targetPrice)}</span>}
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
              {!viz && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(alert.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InvestmentsPage() {
  const { data: assetsData, isLoading, isError } = useAssets()
  const { isVisualizador } = useUserRole()

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null)
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null)
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null)
  const [alertsAsset, setAlertsAsset] = useState<AssetItem | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    try {
      const res = await fetch(`/api/investments/export?format=${format}`)
      if (!res.ok) throw new Error('Erro ao exportar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `carteira.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Dados exportados como ${format.toUpperCase()}`)
    } catch {
      toast.error('Erro ao exportar dados')
    }
  }, [])

  const deleteAsset = useDeleteAsset()
  const deleteTx = useDeleteInvestmentTransaction()

  const assets: AssetItem[] = Array.isArray(assetsData) ? assetsData : []

  const portfolio = useMemo(() => {
    let totalInvested = 0
    const byType: Record<string, number> = {}
    for (const a of assets) {
      const pos = calcPosition(a.transactions)
      totalInvested += pos.invested
      if (pos.invested > 0) {
        byType[a.type] = (byType[a.type] || 0) + pos.invested
      }
    }
    const allocation = Object.entries(byType)
      .map(([type, value]) => ({ name: type, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
    const assetCount = assets.filter((a) => calcPosition(a.transactions).quantity > 0).length
    return { totalInvested, allocation, assetCount }
  }, [assets])

  const allocationChartConfig: ChartConfig = useMemo(() => {
    return portfolio.allocation.reduce((acc, item, idx) => {
      acc[item.name] = {
        label: TYPE_LABELS[item.name] || item.name,
        color: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length],
      }
      return acc
    }, {} as ChartConfig)
  }, [portfolio.allocation])

  const handleDeleteAsset = useCallback(async () => {
    if (!deleteAssetId) return
    try {
      await deleteAsset.mutateAsync(deleteAssetId)
      toast.success('Ativo excluído')
      setDeleteAssetId(null)
      if (selectedAsset?.id === deleteAssetId) setSelectedAsset(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir ativo')
    }
  }, [deleteAssetId, deleteAsset, selectedAsset])

  const handleDeleteTx = useCallback(async () => {
    if (!deleteTxId) return
    try {
      await deleteTx.mutateAsync(deleteTxId)
      toast.success('Transação excluída')
      setDeleteTxId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir transação')
    }
  }, [deleteTxId, deleteTx])

  if (isLoading) return (
    <div className="p-12 text-center text-muted-foreground">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
      <p className="mt-3 text-sm">Carregando</p>
    </div>
  )

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar investimentos</p>
          <p className="text-sm">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Investimentos</h1>
            <p className="text-sm text-muted-foreground">{assets.length} ativos</p>
          </div>
        </div>
        {!isVisualizador && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Nota
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Exportar como CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Exportar como JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ativo
            </Button>
          </div>
        )}
      </div>

      {portfolio.totalInvested > 0 && (
        <>
          <div className="flex gap-6 text-sm flex-wrap">
            <span>Total investido: <strong>{formatCurrency(portfolio.totalInvested)}</strong></span>
            <span>Ativos: <strong>{portfolio.assetCount}</strong></span>
            <span>Tipos: <strong>{portfolio.allocation.length}</strong></span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                  Alocação por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
              <ChartContainer config={allocationChartConfig} className="h-[200px] w-full">
                <PieChart>
                  <Pie data={portfolio.allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {portfolio.allocation.map((entry, i) => (
                      <Cell key={entry.name} fill={ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent formatter={(v: number, name: string) => {
                    const label = TYPE_LABELS[name] || name
                    return (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">{formatCurrency(v)}</span>
                      </div>
                    )
                  }} />} />
                </PieChart>
              </ChartContainer>
              <div className="space-y-1.5 mt-2">
                {portfolio.allocation.map((item, i) => {
                  const pct = ((item.value / portfolio.totalInvested) * 100).toFixed(1)
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
                        <span className="text-muted-foreground">{TYPE_LABELS[item.name] || item.name}</span>
                      </div>
                      <span>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent></Card>

            <Card className="lg:col-span-2">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-medium">Distribuição por Ativo</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {assets.filter((a) => calcPosition(a.transactions).quantity > 0).map((asset) => {
                  const pos = calcPosition(asset.transactions)
                  const pct = ((pos.invested / portfolio.totalInvested) * 100)
                  return (
                    <div key={asset.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20 shrink-0">{asset.ticker}</span>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{pct.toFixed(1)}%</span>
                      <span className="text-xs font-medium w-24 text-right">{formatCurrency(pos.invested)}</span>
                    </div>
                  )
                })}
              </div>
              </CardContent>
            </Card>
          </div>

          <ProfitChart />
        </>
      )}

      {assets.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-muted p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">Nenhum ativo cadastrado</p>
          <p className="text-sm">Clique em "Novo Ativo" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const pos = calcPosition(asset.transactions)
            const typeLabel: Record<string, string> = { STOCK: 'Ação', ETF: 'ETF', CRYPTO: 'Crypto', FIIS: 'FII', BOND: 'Renda Fixa', OTHER: 'Outro' }
            return (
              <Card
                key={asset.id}
                className={`p-4 space-y-3 cursor-pointer transition-colors hover:bg-accent/30 ${selectedAsset?.id === asset.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">{asset.ticker}</span>
                    <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{typeLabel[asset.type] || asset.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); setAlertsAsset(asset) }}
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </Button>
                    {!isVisualizador && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteAssetId(asset.id) }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {asset.name && <p className="text-xs text-muted-foreground">{asset.name}</p>}
                {pos.quantity > 0 ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantidade</span>
                      <span className="font-medium">{pos.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preço médio</span>
                      <span className="font-medium">{formatCurrency(pos.avgPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total investido</span>
                      <span className="font-semibold">{formatCurrency(pos.invested)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sem posição</p>
                )}
                {!isVisualizador && selectedAsset?.id !== asset.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset); setTxDialogOpen(true) }}
                  >
                    <Receipt className="h-3.5 w-3.5 mr-1" />
                    Nova Transação
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {selectedAsset && selectedAsset.transactions.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Transações - {selectedAsset.ticker}</h3>
            {!isVisualizador && (
              <Button size="sm" onClick={() => setTxDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nova
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Data</th>
                  <th className="pb-2 pr-4">Tipo</th>
                  <th className="pb-2 pr-4 text-right">Quantidade</th>
                  <th className="pb-2 pr-4 text-right">Preço</th>
                  <th className="pb-2 pr-4 text-right">Total</th>
                  {!isVisualizador && <th className="pb-2" />}
                </tr>
              </thead>
              <tbody>
                {selectedAsset.transactions.map((tx) => {
                  const total = Number(tx.quantity) * Number(tx.price) + Number(tx.fees) + Number(tx.taxes)
                  const typeLabel: Record<string, string> = { BUY: 'Compra', SELL: 'Venda', DIVIDEND: 'Dividendo', TAX: 'Taxa' }
                  return (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{formatDate(tx.date)}</td>
                      <td className="py-2 pr-4">{typeLabel[tx.type] || tx.type}</td>
                      <td className="py-2 pr-4 text-right">{Number(tx.quantity)}</td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(Number(tx.price))}</td>
                      <td className="py-2 pr-4 text-right font-medium">{formatCurrency(total)}</td>
                      {!isVisualizador && (
                        <td className="py-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTxId(tx.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedAsset && selectedAsset.transactions.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <p className="text-sm">Nenhuma transação registrada para {selectedAsset.ticker}</p>
          {!isVisualizador && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setTxDialogOpen(true)}>
              <Receipt className="h-3.5 w-3.5 mr-1" />
              Registrar primeira transação
            </Button>
          )}
        </Card>
      )}

      <CreateAssetDialog open={createOpen} onOpenChange={setCreateOpen} />

      {selectedAsset && (
        <TransactionDialog
          key={`tx-${selectedAsset.id}-${txDialogOpen}`}
          asset={selectedAsset}
          open={txDialogOpen}
          onOpenChange={setTxDialogOpen}
        />
      )}

      <Dialog open={!!deleteAssetId} onOpenChange={(o) => { if (!o) setDeleteAssetId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Excluir Ativo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este ativo? Todas as transações vinculadas também serão removidas.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteAssetId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteAsset} disabled={deleteAsset.isPending}>
              {deleteAsset.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTxId} onOpenChange={(o) => { if (!o) setDeleteTxId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Excluir Transação</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTxId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteTx} disabled={deleteTx.isPending}>
              {deleteTx.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {alertsAsset && (
        <AlertsDialog
          asset={alertsAsset}
          open={!!alertsAsset}
          onOpenChange={(o) => { if (!o) setAlertsAsset(null) }}
          isVisualizador={isVisualizador}
        />
      )}

      <BrokerNoteUpload
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  )
}
