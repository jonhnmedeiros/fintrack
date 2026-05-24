import { userDb } from '@/lib/tenant-db'

export async function listNotifications() {
  const db = await userDb()
  return db.notification.findMany({ orderBy: { id: 'desc' }, take: 20 })
}

export async function markAsRead(id: string) {
  const db = await userDb()
  return db.notification.update({ where: { id }, data: { read: true } })
}

export async function createNotification(title: string, body: string) {
  const db = await userDb()
  return db.notification.create({ data: { title, body } })
}
