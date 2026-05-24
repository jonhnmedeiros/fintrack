import { createAPIFileRoute } from '@tanstack/start'
import * as assetsApi from '@/features/investments/api/assets'

export const APIRoute = createAPIFileRoute('/api/assets/$id')({
  DELETE: async ({ params }) => {
    await assetsApi.deleteAsset(params.id)
    return new Response(null, { status: 204 })
  },
})
