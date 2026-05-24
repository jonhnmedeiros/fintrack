import { createAPIFileRoute } from '@tanstack/start'
import * as categoriesApi from '@/features/finance/api/categories'

export const APIRoute = createAPIFileRoute('/api/categories/$id')({
  PUT: async ({ request, params }) => {
    const body = await request.json()
    const category = await categoriesApi.updateCategory(params.id, body)
    return Response.json(category)
  },
  DELETE: async ({ params }) => {
    await categoriesApi.deleteCategory(params.id)
    return new Response(null, { status: 204 })
  },
})
