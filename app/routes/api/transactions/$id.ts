import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/transactions/$id')({})

export const APIRoute = createAPIFileRoute('/api/transactions/$id')({
  DELETE: async ({ params }) => {
    const { userDb } = await import('@/lib/tenant-db')
    const db = await userDb()
    await db.transaction.delete({ where: { id: params.id } })
    return new Response(null, { status: 204 })
  },
})

