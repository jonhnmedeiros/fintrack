import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128, 'Máximo 128 caracteres'),
})

export async function registerUser(email: string, password: string) {
  const validated = registerSchema.parse({ email, password })
  const normalizedEmail = validated.email.toLowerCase().trim()

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })
  if (existing) {
    return new Response('Este email já está em uso', { status: 422 })
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10)

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
    },
  })

  return Response.json({ id: user.id, email: user.email })
}

export { registerSchema }
