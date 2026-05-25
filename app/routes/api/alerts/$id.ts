import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/alerts/$id')({})

export const APIRoute = createAPIFileRoute('/api/alerts/$id')({
  DELETE: async ({ params }) => {
    const { deleteAlert } = await import('@/features/investments/api/alerts')
    await deleteAlert(params.id)
    return new Response(null, { status: 204 })
  },
})

