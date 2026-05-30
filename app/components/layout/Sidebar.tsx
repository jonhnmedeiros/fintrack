import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  BarChart3,
  Settings,
  CreditCard,
  Tags,
  PiggyBank,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: Receipt },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { href: '/budget', label: 'Orçamentos', icon: PiggyBank },
  { href: '/investments', label: 'Investimentos', icon: TrendingUp },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <aside className="w-16 lg:w-60 bg-card border-r min-h-screen p-4 hidden sm:flex sm:flex-col">
      <div className="flex items-center gap-2 mb-8 justify-center lg:justify-normal">
        <TrendingUp className="h-6 w-6 shrink-0" />
        <span className="text-xl font-bold hidden lg:inline">FinTrack</span>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors justify-center lg:justify-normal',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
