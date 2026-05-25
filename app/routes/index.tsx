import { createFileRoute } from '@tanstack/react-router'
import { SummaryCards } from '@/features/dashboard/components/SummaryCards'
import { CashFlowChart } from '@/features/dashboard/components/CashFlowChart'
import { ExpenseByCategoryChart } from '@/features/dashboard/components/ExpenseByCategoryChart'
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { transactions, assets, budgets } = useDashboardData()

  if (transactions.isLoading || assets.isLoading) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <SummaryCards transactions={transactions.data || []} assets={assets.data || []} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart transactions={transactions.data || []} />
        <ExpenseByCategoryChart transactions={transactions.data || []} />
      </div>
      <RecentTransactions transactions={transactions.data || []} />
    </div>
  )
}
