import { prisma } from '@/lib/db'
import { z } from 'zod'

const updatePreferencesSchema = z.object({
  investExpenseCategoryId: z.string().nullable().optional(),
  investIncomeCategoryId: z.string().nullable().optional(),
})

export async function getInvestPreferences(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { investExpenseCategoryId: true, investIncomeCategoryId: true },
  })
  return user ?? { investExpenseCategoryId: null, investIncomeCategoryId: null }
}

export async function updateInvestPreferences(userId: string, data: unknown) {
  const validated = updatePreferencesSchema.parse(data)
  // Garante que a categoria escolhida pertence ao próprio usuário e tem o
  // tipo certo (despesa/receita) — evita salvar um categoryId inválido ou
  // de outro usuário (ex: titular configurando para um visualizador).
  if (validated.investExpenseCategoryId) {
    const cat = await prisma.category.findUnique({ where: { id: validated.investExpenseCategoryId } })
    if (!cat || cat.userId !== userId || cat.type !== 'EXPENSE') {
      throw new Error('Categoria de despesa inválida')
    }
  }
  if (validated.investIncomeCategoryId) {
    const cat = await prisma.category.findUnique({ where: { id: validated.investIncomeCategoryId } })
    if (!cat || cat.userId !== userId || cat.type !== 'INCOME') {
      throw new Error('Categoria de receita inválida')
    }
  }

  // Só atualiza os campos que vieram de fato no payload — o formulário salva
  // um campo por vez (débito OU crédito), e usar `?? null` em ambos sempre
  // zerava o campo que não foi enviado nessa chamada.
  const updateData: { investExpenseCategoryId?: string | null; investIncomeCategoryId?: string | null } = {}
  if (Object.prototype.hasOwnProperty.call(data as object, 'investExpenseCategoryId')) {
    updateData.investExpenseCategoryId = validated.investExpenseCategoryId ?? null
  }
  if (Object.prototype.hasOwnProperty.call(data as object, 'investIncomeCategoryId')) {
    updateData.investIncomeCategoryId = validated.investIncomeCategoryId ?? null
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { investExpenseCategoryId: true, investIncomeCategoryId: true },
  })
}
