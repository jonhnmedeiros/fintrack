import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/categories/')({})

export const APIRoute = createAPIFileRoute('/api/categories/')({
  GET: async () => {
    const { listCategories } = await import('@/features/finance/api/categories')
    const categories = await listCategories()
    return Response.json(categories)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const { createCategory } = await import('@/features/finance/api/categories')
    const category = await createCategory(body)
    return Response.json(category)
  },
})

