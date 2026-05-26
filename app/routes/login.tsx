import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { data: session, status } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (status === 'authenticated') {
      navigate({ to: '/' })
    }
  }, [status, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <LoginForm />
    </div>
  )
}
