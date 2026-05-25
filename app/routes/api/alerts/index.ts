import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/alerts/')({})

export const APIRoute = createAPIFileRoute('/api/alerts/')({
  GET: async () => {
    const { listAlerts } = await import('@/features/investments/api/alerts')
    const alerts = await listAlerts()
    return Response.json(alerts)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const { createAlert } = await import('@/features/investments/api/alerts')
    const alert = await createAlert(body)
    return Response.json(alert)
  },
})

