import { useState, useMemo } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, ColumnDef, SortingState
} from '@tanstack/react-table'
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useFinanceStore } from '@/store/useFinanceStore'
import { Transaction } from '@/types'
import { formatCurrency, formatDate, categoryLabels, categoryColors, getTransactionTypeColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TYPE_LABELS = { income: 'Receita', expense: 'Despesa', transfer: 'Transferência' }

export function TransactionsPage() {
  const { transactions, deleteTransaction } = useFinanceStore()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filtered = useMemo(() =>
    typeFilter === 'all' ? transactions : transactions.filter((t) => t.type === typeFilter),
    [transactions, typeFilter]
  )

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm shrink-0"
            style={{ borderLeft: `3px solid ${categoryColors[row.original.category] || '#6b7280'}` }}>
            {row.original.type === 'income' ? '↑' : row.original.type === 'expense' ? '↓' : '↔'}
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-100">{row.original.description}</p>
            <p className="text-xs text-zinc-500">{categoryLabels[row.original.category]}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ getValue }) => {
        const t = getValue() as Transaction['type']
        return (
          <span className={cn(
            'badge',
            t === 'income' ? 'badge-green' : t === 'expense' ? 'badge-red' : 'badge-blue'
          )}>
            {TYPE_LABELS[t]}
          </span>
        )
      }
    },
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ getValue }) => <span className="text-sm text-zinc-400">{formatDate(getValue() as string)}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => (
        <span className={cn('text-sm font-semibold font-mono', getTransactionTypeColor(row.original.type))}>
          {row.original.type === 'income' ? '+' : row.original.type === 'expense' ? '-' : ''}
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <button
          onClick={() => deleteTransaction(row.original.id)}
          className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ]

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  })

  return (
    <div className="p-6 space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Transações</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{transactions.length} transações registradas</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Nova transação
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9"
            placeholder="Buscar transações..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'income', 'expense', 'transfer'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                typeFilter === t
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : 'text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              )}
            >
              {t === 'all' ? 'Todas' : TYPE_LABELS[t as keyof typeof TYPE_LABELS]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-zinc-800">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 first:pl-5 last:pr-5">
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn('flex items-center gap-1.5 hover:text-zinc-300 transition-colors', header.column.getCanSort() && 'cursor-pointer')}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} />}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 first:pl-5 last:pr-5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">
            {table.getFilteredRowModel().rows.length} resultados
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
