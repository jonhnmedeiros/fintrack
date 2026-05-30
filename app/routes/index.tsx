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
  const { currentMonthTransactions, last6MonthsTransactions, assets } = useDashboardData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {currentMonthTransactions.isError ? (
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar dados</p>
          <p className="text-sm">Tente novamente mais tarde.</p>
        </div>
      ) : (
        <SummaryCards
          transactions={currentMonthTransactions.data || []}
          assets={assets.data || []}
          isLoading={currentMonthTransactions.isLoading || assets.isLoading}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {last6MonthsTransactions.isError ? (
          <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
            <p className="text-lg font-medium">Erro ao carregar gráficos</p>
          </div>
        ) : (
          <CashFlowChart
            transactions={last6MonthsTransactions.data || []}
            isLoading={last6MonthsTransactions.isLoading}
          />
        )}
        {currentMonthTransactions.isError ? (
          <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
            <p className="text-lg font-medium">Erro ao carregar gráficos</p>
          </div>
        ) : (
          <ExpenseByCategoryChart
            transactions={currentMonthTransactions.data || []}
            isLoading={currentMonthTransactions.isLoading}
          />
        )}
      </div>

      <RecentTransactions
        transactions={currentMonthTransactions.data || []}
        isLoading={currentMonthTransactions.isLoading}
      />
    </div>
  )
}
