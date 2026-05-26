import { createFileRoute } from '@tanstack/react-router'
import { mockNextAuthHandler } from '@/lib/auth-handler'

export const Route = createFileRoute('/api/auth/$')({})

export const APIRoute = {
  path: '/api/auth/$',
  methods: {
    GET: async ({ request }: { request: Request }) => mockNextAuthHandler(request),
    POST: async ({ request }: { request: Request }) => mockNextAuthHandler(request),
  },
}
