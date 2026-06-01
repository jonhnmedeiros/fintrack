import { useQuery } from '@tanstack/react-query'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

interface DateRange {
  startDate: string
  endDate: string
}

export function useDashboardData(dateRange?: DateRange) {
  const now = new Date()
  const cm = dateRange || {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  }

  const l6mStart = startOfMonth(subMonths(now, 5))
  const l6mEnd = endOfMonth(now)
  const l6m = {
    startDate: format(l6mStart, 'yyyy-MM-dd'),
    endDate: format(l6mEnd, 'yyyy-MM-dd'),
  }

  const currentMonthTransactions = useQuery({
    queryKey: ['dashboard', 'current-month', cm],
    queryFn: () => fetch(`/api/transactions?startDate=${cm.startDate}&endDate=${cm.endDate}`).then((r) => r.json()),
  })

  const last6MonthsTransactions = useQuery({
    queryKey: ['dashboard', '6-months', l6m],
    queryFn: () => fetch(`/api/transactions?startDate=${l6m.startDate}&endDate=${l6m.endDate}`).then((r) => r.json()),
  })

  const assets = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then((r) => r.json()),
  })

  return { currentMonthTransactions, last6MonthsTransactions, assets }
}
