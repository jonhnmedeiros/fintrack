import { userDb } from '@/lib/tenant-db'
import { createAlertSchema } from '../schemas'

export async function listAlerts() {
  const db = await userDb()
  return db.alert.findMany({
    where: { active: true },
    orderBy: { type: 'asc' },
    include: { asset: true },
  })
}

export async function createAlert(data: unknown) {
  const validated = createAlertSchema.parse(data)
  const db = await userDb()
  return db.alert.create({ data: validated })
}

export async function deleteAlert(id: string) {
  const db = await userDb()
  return db.alert.update({ where: { id }, data: { active: false } })
}
