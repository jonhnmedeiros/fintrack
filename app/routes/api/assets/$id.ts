import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/assets/$id')({})

export const APIRoute = createAPIFileRoute('/api/assets/$id')({
  DELETE: async ({ params }) => {
    const { deleteAsset } = await import('@/features/investments/api/assets')
    await deleteAsset(params.id)
    return new Response(null, { status: 204 })
  },
})

