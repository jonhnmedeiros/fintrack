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

const tabItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: Receipt },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { href: '/budget', label: 'Orçamentos', icon: PiggyBank },
  { href: '/investments', label: 'Investimentos', icon: TrendingUp },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function BottomTabBar() {
  const location = useLocation()

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t sm:hidden">
      <div className="flex items-center justify-around h-16">
        {tabItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
