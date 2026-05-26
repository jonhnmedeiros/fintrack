import { createFileRoute } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <RegisterForm />
    </div>
  )
}
