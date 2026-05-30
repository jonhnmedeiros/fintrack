import { useSession } from 'next-auth/react'

export type UserRole = 'TITULAR' | 'VISUALIZADOR'

export function useUserRole(): {
  role: UserRole | undefined
  isTitular: boolean
  isVisualizador: boolean
} {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as UserRole | undefined

  return {
    role,
    isTitular: role === 'TITULAR',
    isVisualizador: role === 'VISUALIZADOR',
  }
}
