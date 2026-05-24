import { createAPIFileRoute } from '@tanstack/start'
import * as alertsApi from '@/features/investments/api/alerts'

export const APIRoute = createAPIFileRoute('/api/alerts/')({
  GET: async () => {
    const alerts = await alertsApi.listAlerts()
    return Response.json(alerts)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const alert = await alertsApi.createAlert(body)
    return Response.json(alert)
  },
})
