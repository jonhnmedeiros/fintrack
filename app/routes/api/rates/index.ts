import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/rates/')({})

export const APIRoute = {
  path: '/api/rates/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getReferenceRates } = await import('@/lib/rates')
      try {
        const rates = await getReferenceRates()
        return Response.json(rates)
      } catch (err) {
        return Response.json({ error: 'Erro ao buscar taxas de referência (CDI/IPCA)' }, { status: 502 })
      }
    },
  },
}
