import { userDb } from '@/lib/tenant-db'
import { createCategorySchema } from '../schemas'

export async function listCategories(userId: string) {
  const db = userDb(userId)
  return db.category.findMany({ orderBy: { name: 'asc' } })
}

export async function createCategory(userId: string, data: unknown) {
  const validated = createCategorySchema.parse(data)
  const db = userDb(userId)
  if (validated.parentId) {
    const parents = await db.category.findMany({ where: { id: validated.parentId } })
    if (parents.length === 0) throw new Error('Categoria pai não encontrada')
    if (parents[0].parentId) throw new Error('Não é permitido criar subcategoria de uma subcategoria')
  }
  return db.category.create({ data: validated })
}

export async function updateCategory(userId: string, id: string, data: unknown) {
  const validated = createCategorySchema.partial().parse(data)
  const db = userDb(userId)
  return db.category.update({ where: { id }, data: validated })
}

export async function deleteCategory(userId: string, id: string) {
  const db = userDb(userId)
  return db.category.delete({ where: { id } })
}
