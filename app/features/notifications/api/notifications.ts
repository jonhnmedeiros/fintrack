import { userDb } from '@/lib/tenant-db'

export async function listNotifications(userId: string) {
  const db = userDb(userId)
  return db.notification.findMany({ orderBy: { id: 'desc' }, take: 20 })
}

export async function markAsRead(userId: string, id: string) {
  const db = userDb(userId)
  return db.notification.update({ where: { id }, data: { read: true } })
}

export async function createNotification(userId: string, title: string, body: string) {
  const db = userDb(userId)
  return db.notification.create({ data: { title, body } })
}
