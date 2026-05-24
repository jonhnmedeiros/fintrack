import { createAPIFileRoute } from '@tanstack/start'
import * as assetsApi from '@/features/investments/api/assets'

export const APIRoute = createAPIFileRoute('/api/assets')({
  GET: async () => {
    const assets = await assetsApi.listAssets()
    return Response.json(assets)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const asset = await assetsApi.createAsset(body)
    return Response.json(asset)
  },
})
