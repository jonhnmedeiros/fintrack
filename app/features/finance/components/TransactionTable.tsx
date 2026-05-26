import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDeleteTransaction } from '../hooks/useTransactions'
import { Trash2 } from 'lucide-react'

interface TransactionTableProps {
  transactions: Array<{
    id: string
    type: string
    description: string | null
    amount: number
    date: string
    category: { name: string } | null
  }>
}

export function TransactionTable({ transactions }: TransactionTableProps) {
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
      cell: ({ getValue }: { getValue: () => string | null }) => getValue() || '-',
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ getValue }: { getValue: () => { name: string } | null }) => getValue()?.name || '-',
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
    {
      id: 'actions',
      cell: ({ row }: { row: { original: { id: string } } }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(row.original.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
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
  )
}
