import { userDb } from '@/lib/tenant-db'
import { createCategorySchema } from '../schemas'
import { z } from 'zod'

export async function listCategories() {
  const db = await userDb()
  return db.category.findMany({ orderBy: { name: 'asc' } })
}

export async function createCategory(data: unknown) {
  const validated = createCategorySchema.parse(data)
  const db = await userDb()
  return db.category.create({ data: validated })
}

export async function updateCategory(id: string, data: Partial<z.infer<typeof createCategorySchema>>) {
  const db = await userDb()
  return db.category.update({ where: { id }, data })
}

export async function deleteCategory(id: string) {
  const db = await userDb()
  return db.category.delete({ where: { id } })
}
