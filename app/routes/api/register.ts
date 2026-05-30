import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/register')({})

export const APIRoute = {
  path: '/api/register',
  methods: {
    POST: async ({ request }) => {
      const body = await request.json()
      const { email, password, inviteToken } = body
      const { registerUser } = await import('@/features/auth/api/register')
      return registerUser(email, password, inviteToken)
    },
  },
}
