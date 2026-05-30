import { useLocation } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { BottomTabBar } from './BottomTabBar'
import { Header } from './Header'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 max-sm:p-4 pb-20 sm:pb-0">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}
