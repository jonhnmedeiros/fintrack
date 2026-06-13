import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SummaryCards } from '@/features/dashboard/components/SummaryCards'
import { CashFlowChart } from '@/features/dashboard/components/CashFlowChart'
import { ExpenseByCategoryChart } from '@/features/dashboard/components/ExpenseByCategoryChart'
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions'
import { TopExpensesByCategory } from '@/features/dashboard/components/TopExpensesByCategory'
import { CategorySpendingCard } from '@/features/dashboard/components/CategorySpendingCard'
import { PeriodSelector } from '@/features/dashboard/components/PeriodSelector'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { useCategories } from '@/features/finance/hooks/useCategories'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const now = new Date()
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  })

  const { currentMonthTransactions, last6MonthsTransactions, assets } = useDashboardData(dateRange)
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <PeriodSelector value={dateRange} onChange={setDateRange} />
      </div>

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

      {currentMonthTransactions.isError ? (
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar gráficos</p>
        </div>
      ) : (
        <TopExpensesByCategory
          transactions={currentMonthTransactions.data || []}
          isLoading={currentMonthTransactions.isLoading}
        />
      )}

      {currentMonthTransactions.isError ? (
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar gráficos</p>
        </div>
      ) : (
        <CategorySpendingCard
          transactions={currentMonthTransactions.data || []}
          categories={categories || []}
          isLoading={currentMonthTransactions.isLoading || categoriesLoading}
        />
      )}

      <RecentTransactions
        transactions={currentMonthTransactions.data || []}
        isLoading={currentMonthTransactions.isLoading}
      />
    </div>
  )
}
