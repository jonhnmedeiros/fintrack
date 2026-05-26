import { userDb } from '@/lib/tenant-db'
import { createAlertSchema } from '../schemas'

export async function listAlerts(userId: string) {
  const db = userDb(userId)
  return db.alert.findMany({
    where: { active: true },
    orderBy: { type: 'asc' },
    include: { asset: true },
  })
}

export async function createAlert(userId: string, data: unknown) {
  const validated = createAlertSchema.parse(data)
  const db = userDb(userId)
  return db.alert.create({ data: validated })
}

export async function deleteAlert(userId: string, id: string) {
  const db = userDb(userId)
  return db.alert.update({ where: { id }, data: { active: false } })
}
