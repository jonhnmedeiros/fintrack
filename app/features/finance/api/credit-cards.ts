import { userDb } from '@/lib/tenant-db'
import { createCreditCardSchema } from '../schemas'

export async function listCreditCards() {
  const db = await userDb()
  return db.creditCard.findMany({ orderBy: { name: 'asc' } })
}

export async function createCreditCard(data: unknown) {
  const validated = createCreditCardSchema.parse(data)
  const db = await userDb()
  return db.creditCard.create({ data: validated })
}

export async function deleteCreditCard(id: string) {
  const db = await userDb()
  return db.creditCard.delete({ where: { id } })
}
