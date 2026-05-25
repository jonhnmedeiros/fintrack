import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/assets/')({})

export const APIRoute = createAPIFileRoute('/api/assets/')({
  GET: async () => {
    const { listAssets } = await import('@/features/investments/api/assets')
    const assets = await listAssets()
    return Response.json(assets)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const { createAsset } = await import('@/features/investments/api/assets')
    const asset = await createAsset(body)
    return Response.json(asset)
  },
})

