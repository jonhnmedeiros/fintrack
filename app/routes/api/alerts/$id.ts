import { createAPIFileRoute } from '@tanstack/start'
import * as alertsApi from '@/features/investments/api/alerts'

export const APIRoute = createAPIFileRoute('/api/alerts/$id')({
  DELETE: async ({ params }) => {
    await alertsApi.deleteAlert(params.id)
    return new Response(null, { status: 204 })
  },
})
