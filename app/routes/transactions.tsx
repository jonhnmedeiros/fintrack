import { createFileRoute } from '@tanstack/react-router'
import { TransactionTable } from '@/features/finance/components/TransactionTable'
import { TransactionForm } from '@/features/finance/components/TransactionForm'
import { useTransactions } from '@/features/finance/hooks/useTransactions'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const { data, isLoading } = useTransactions()

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transações</h1>
        <TransactionForm />
      </div>
      <TransactionTable transactions={data || []} />
    </div>
  )
}
