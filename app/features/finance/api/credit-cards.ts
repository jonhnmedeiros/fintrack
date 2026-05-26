import { userDb } from '@/lib/tenant-db'
import { createCreditCardSchema } from '../schemas'

export async function listCreditCards(userId: string) {
  const db = userDb(userId)
  return db.creditCard.findMany({ orderBy: { name: 'asc' } })
}

export async function createCreditCard(userId: string, data: unknown) {
  const validated = createCreditCardSchema.parse(data)
  const db = userDb(userId)
  return db.creditCard.create({ data: validated })
}

export async function deleteCreditCard(userId: string, id: string) {
  const db = userDb(userId)
  return db.creditCard.delete({ where: { id } })
}
