import { createFileRoute, useSearch } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const search = useSearch({ from: '/register' })
  const inviteToken = (search as { invite?: string }).invite

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <RegisterForm inviteToken={inviteToken} />
    </div>
  )
}
