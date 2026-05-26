import { userDb } from '@/lib/tenant-db'
import { createCategorySchema } from '../schemas'
import { z } from 'zod'

export async function listCategories(userId: string) {
  const db = userDb(userId)
  return db.category.findMany({ orderBy: { name: 'asc' } })
}

export async function createCategory(userId: string, data: unknown) {
  const validated = createCategorySchema.parse(data)
  const db = userDb(userId)
  return db.category.create({ data: validated })
}

export async function updateCategory(userId: string, id: string, data: Partial<z.infer<typeof createCategorySchema>>) {
  const db = userDb(userId)
  return db.category.update({ where: { id }, data })
}

export async function deleteCategory(userId: string, id: string) {
  const db = userDb(userId)
  return db.category.delete({ where: { id } })
}
