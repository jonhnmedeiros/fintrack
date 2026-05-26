import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/auth/register')({})

export const APIRoute = {
  path: '/api/auth/register',
  methods: {
    POST: async ({ request }) => {
      const { email, password } = await request.json()
      const { registerUser } = await import('@/features/auth/api/register')
      return registerUser(email, password)
    },
  },
}
