import { Link, useLocation } from '@tanstack/start'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  PieChart,
  Target,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: Receipt },
  { href: '/investments', label: 'Investimentos', icon: TrendingUp },
  { href: '/budget', label: 'Orçamento', icon: PieChart },
  { href: '/goals', label: 'Metas', icon: Target },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <TrendingUp className="h-6 w-6" />
        <span className="text-xl font-bold">FinTrack</span>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
