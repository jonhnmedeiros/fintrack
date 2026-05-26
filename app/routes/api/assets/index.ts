import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/assets/')({})

export const APIRoute = {
  path: '/api/assets/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { listAssets } = await import('@/features/investments/api/assets')
      const assets = await listAssets(session.user.id)
      return Response.json(assets)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const body = await request.json()
      const { createAsset } = await import('@/features/investments/api/assets')
      const asset = await createAsset(session.user.id, body)
      return Response.json(asset)
    },
  },
}

