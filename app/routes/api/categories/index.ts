import { createAPIFileRoute } from '@tanstack/start'
import * as categoriesApi from '@/features/finance/api/categories'

export const APIRoute = createAPIFileRoute('/api/categories')({
  GET: async () => {
    const categories = await categoriesApi.listCategories()
    return Response.json(categories)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const category = await categoriesApi.createCategory(body)
    return Response.json(category)
  },
})
