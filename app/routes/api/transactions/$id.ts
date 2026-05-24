import { createAPIFileRoute } from '@tanstack/start'
import { userDb } from '@/lib/tenant-db'

export const APIRoute = createAPIFileRoute('/api/transactions/$id')({
  DELETE: async ({ params }) => {
    const db = await userDb()
    await db.transaction.delete({ where: { id: params.id } })
    return new Response(null, { status: 204 })
  },
})
