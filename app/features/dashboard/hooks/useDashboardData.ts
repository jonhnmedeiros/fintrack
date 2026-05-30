import { useQuery } from '@tanstack/react-query'

function getMonthStartEnd(monthsAgo = 0) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate()
  return { startDate: `${year}-${month}-01`, endDate: `${year}-${month}-${lastDay}` }
}

function getLast6MonthsRange() {
  const now = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 5)
  start.setDate(1)
  const sy = start.getFullYear()
  const sm = String(start.getMonth() + 1).padStart(2, '0')
  const ey = now.getFullYear()
  const em = String(now.getMonth() + 1).padStart(2, '0')
  return { startDate: `${sy}-${sm}-01`, endDate: `${ey}-${em}-${now.getDate()}` }
}

export function useDashboardData() {
  const cm = getMonthStartEnd(0)
  const l6m = getLast6MonthsRange()

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
