import { useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDeleteTransaction } from '../hooks/useTransactions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface TransactionType {
  id: string
  type: string
  description: string | null
  amount: number
  date: string
  category: { name: string } | null
  categoryId: string | null
  creditCardId: string | null
  walletId: string | null
  toWalletId: string | null
  wallet?: { name: string } | null
  toWallet?: { name: string } | null
  installmentNumber: number | null
  totalInstallments: number | null
  installmentGroupId: string | null
}

interface TransactionTableProps {
  transactions: TransactionType[]
  showActions?: boolean
  onEdit?: (tx: TransactionType) => void
}

export function TransactionTable({ transactions, showActions = true, onEdit }: TransactionTableProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteTransaction()

  const columns = [
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ getValue }: { getValue: () => string }) => formatDate(getValue()),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }: { row: { original: TransactionType } }) => {
        const { description, installmentNumber, totalInstallments } = row.original
        return (
          <span>
            {description || '-'}
            {installmentNumber != null && totalInstallments && totalInstallments > 1 && (
              <span className="ml-2 text-xs text-muted-foreground border rounded px-1">
                {installmentNumber}/{totalInstallments}
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ getValue }: { getValue: () => { name: string } | null }) => getValue()?.name || '-',
    },
    {
      accessorKey: 'wallet',
      header: 'Conta',
      cell: ({ row }: { row: { original: TransactionType } }) => {
        const { type, wallet, toWallet } = row.original
        if (type === 'TRANSFER') {
          return <span className="text-sm">{wallet?.name || '-'} → {toWallet?.name || '-'}</span>
        }
        return <span className="text-sm">{wallet?.name || '-'}</span>
      },
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }: { row: { original: { type: string; amount: number } } }) => {
        const { type, amount } = row.original
        const color = type === 'INCOME' ? 'text-green-500' : type === 'EXPENSE' ? 'text-red-500' : 'text-blue-500'
        const sign = type === 'INCOME' ? '+' : type === 'EXPENSE' ? '-' : '→'
        return <span className={`font-semibold ${color}`}>{sign} {formatCurrency(Number(amount))}</span>
      },
    },
    ...(showActions ? [{
      id: 'actions',
      cell: ({ row }: { row: { original: TransactionType } }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar transação"
            onClick={() => onEdit?.(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Excluir transação"
            onClick={() => setPendingDeleteId(row.original.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    }] : []),
  ]

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function handleDeleteConfirm() {
    if (!pendingDeleteId) return
    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: () => {
        toast.success('Transação excluída')
        setPendingDeleteId(null)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Erro ao excluir transação')
      },
    })
  }

  return (
    <>
      <Dialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Desktop/tablet: tabela tradicional. Some abaixo do breakpoint sm — no
        celular, uma tabela de 5-6 colunas não cabe na tela e força scroll
        horizontal sem indicação visual (ver versão em cards logo abaixo). */}
    <div className="hidden sm:block rounded-md border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 text-left text-sm font-medium">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile: cada transação vira um card — tudo visível sem scroll horizontal. */}
    <div className="sm:hidden rounded-md border divide-y">
      {transactions.map((tx) => {
        const color = tx.type === 'INCOME' ? 'text-green-500' : tx.type === 'EXPENSE' ? 'text-red-500' : 'text-blue-500'
        const sign = tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '→'
        const accountLabel = tx.type === 'TRANSFER'
          ? `${tx.wallet?.name || '-'} → ${tx.toWallet?.name || '-'}`
          : tx.wallet?.name || '-'
        return (
          <div key={tx.id} className="p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {tx.description || '-'}
                  {tx.installmentNumber != null && tx.totalInstallments && tx.totalInstallments > 1 && (
                    <span className="ml-2 text-xs text-muted-foreground border rounded px-1 align-middle">
                      {tx.installmentNumber}/{tx.totalInstallments}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
              </div>
              <span className={`font-semibold text-sm whitespace-nowrap ${color}`}>
                {sign} {formatCurrency(Number(tx.amount))}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground truncate">
                {tx.category?.name || '-'} · {accountLabel}
              </p>
              {showActions && (
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar transação" onClick={() => onEdit?.(tx)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Excluir transação"
                    onClick={() => setPendingDeleteId(tx.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
    </>
  )
}
