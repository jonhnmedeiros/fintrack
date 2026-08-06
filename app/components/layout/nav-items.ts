import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  BarChart3,
  Settings,
  CreditCard,
  Tags,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: Receipt },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/wallets', label: 'Contas', icon: Wallet },
  { href: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { href: '/budget', label: 'Orçamentos', icon: PiggyBank },
  { href: '/investments', label: 'Investimentos', icon: TrendingUp },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/settings', label: 'Configurações', icon: Settings },
]
