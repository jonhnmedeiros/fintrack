import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/categories/$id')({})

export const APIRoute = createAPIFileRoute('/api/categories/$id')({
  PUT: async ({ request, params }) => {
    const body = await request.json()
    const { updateCategory } = await import('@/features/finance/api/categories')
    const category = await updateCategory(params.id, body)
    return Response.json(category)
  },
  DELETE: async ({ params }) => {
    const { deleteCategory } = await import('@/features/finance/api/categories')
    await deleteCategory(params.id)
    return new Response(null, { status: 204 })
  },
})

