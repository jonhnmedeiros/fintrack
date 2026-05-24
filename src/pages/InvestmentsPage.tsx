import { useState } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender, ColumnDef, SortingState
} from '@tanstack/react-table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Plus, ArrowUpDown } from 'lucide-react'
import { useFinanceStore } from '@/store/useFinanceStore'
import { Investment } from '@/types'
import { formatCurrency, formatPercent, calcInvestmentReturn, cn } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  stock: 'Ação', fii: 'FII', tesouro: 'Tesouro', cdb: 'CDB', crypto: 'Cripto', fund: 'Fundo', other: 'Outro'
}

const TYPE_COLORS: Record<string, string> = {
  stock: '#22c55e', fii: '#3b82f6', tesouro: '#f59e0b', cdb: '#8b5cf6', crypto: '#f97316', fund: '#ec4899', other: '#6b7280'
}

export function InvestmentsPage() {
  const { investments } = useFinanceStore()
  const [sorting, setSorting] = useState<SortingState>([])

  const totalInvested = investments.reduce((s, i) => s + i.quantity * i.avgPrice, 0)
  const totalCurrent = investments.reduce((s, i) => s + i.quantity * i.currentPrice, 0)
  const totalReturn = totalCurrent - totalInvested
  const totalReturnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  // By type chart
  const byType = Object.entries(
    investments.reduce((acc, inv) => {
      const val = inv.quantity * inv.currentPrice
      acc[inv.type] = (acc[inv.type] || 0) + val
      return acc
    }, {} as Record<string, number>)
  ).map(([type, value]) => ({ type: TYPE_LABELS[type] || type, value, color: TYPE_COLORS[type] || '#6b7280' }))

  const columns: ColumnDef<Investment>[] = [
    {
      accessorKey: 'ticker',
      header: 'Ativo',
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: TYPE_COLORS[row.original.type] + '22', color: TYPE_COLORS[row.original.type] }}>
              {TYPE_LABELS[row.original.type] || row.original.type}
            </span>
            <span className="text-sm font-semibold text-zinc-100 font-mono">{row.original.ticker}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{row.original.name}</p>
        </div>
      )
    },
    {
      accessorKey: 'quantity',
      header: 'Qtd.',
      cell: ({ getValue }) => <span className="text-sm font-mono text-zinc-300">{(getValue() as number).toLocaleString('pt-BR')}</span>
    },
    {
      accessorKey: 'avgPrice',
      header: 'Preço Médio',
      cell: ({ getValue }) => <span className="text-sm font-mono text-zinc-400">{formatCurrency(getValue() as number)}</span>
    },
    {
      accessorKey: 'currentPrice',
      header: 'Preço Atual',
      cell: ({ row }) => {
        const { percent } = calcInvestmentReturn(row.original.quantity, row.original.avgPrice, row.original.currentPrice)
        return (
          <div>
            <span className="text-sm font-mono text-zinc-100">{formatCurrency(row.original.currentPrice)}</span>
            <span className={cn('ml-2 text-xs font-medium', percent >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatPercent(percent)}
            </span>
          </div>
        )
      }
    },
    {
      id: 'total',
      header: 'Total Atual',
      accessorFn: (row) => row.quantity * row.currentPrice,
      cell: ({ getValue }) => <span className="text-sm font-semibold font-mono text-zinc-100">{formatCurrency(getValue() as number)}</span>
    },
    {
      id: 'profit',
      header: 'Resultado',
      accessorFn: (row) => calcInvestmentReturn(row.quantity, row.avgPrice, row.currentPrice).profit,
      cell: ({ getValue }) => {
        const v = getValue() as number
        return <span className={cn('text-sm font-semibold font-mono', v >= 0 ? 'text-green-400' : 'text-red-400')}>{formatCurrency(v)}</span>
      }
    },
    {
      accessorKey: 'broker',
      header: 'Corretora',
      cell: ({ getValue }) => <span className="text-sm text-zinc-500">{getValue() as string}</span>
    },
  ]

  const table = useReactTable({
    data: investments,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="p-6 space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Investimentos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{investments.length} ativos na carteira</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Novo ativo
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-zinc-500">Total Investido</p>
          <p className="text-xl font-semibold font-mono text-zinc-100 mt-1">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-zinc-500">Patrimônio Atual</p>
          <p className="text-xl font-semibold font-mono text-zinc-100 mt-1">{formatCurrency(totalCurrent)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-zinc-500">Resultado Total</p>
          <div className="flex items-center gap-2 mt-1">
            {totalReturn >= 0
              ? <TrendingUp size={16} className="text-green-400 shrink-0" />
              : <TrendingDown size={16} className="text-red-400 shrink-0" />}
            <p className={cn('text-xl font-semibold font-mono', totalReturn >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatCurrency(totalReturn)}
            </p>
            <span className={cn('badge text-xs', totalReturn >= 0 ? 'badge-green' : 'badge-red')}>
              {formatPercent(totalReturnPct)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart + table */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <h2 className="font-medium text-zinc-100 mb-4">Alocação por Tipo</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="type" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                itemStyle={{ fontSize: 13 }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Valor">
                {byType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden col-span-2">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-zinc-800">
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 first:pl-5">
                      <button onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown size={11} />
                      </button>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 first:pl-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
