import { prisma } from './db'
import { auth } from './auth'

export async function userDb() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: no user session')
  }
  const userId = session.user.id

  return {
    transaction: {
      findMany: (args?: Parameters<typeof prisma.transaction.findMany>[0]) =>
        prisma.transaction.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.transaction.create>[0]) =>
        prisma.transaction.create({ ...args, data: { ...args.data, userId } }),
      update: (args: Parameters<typeof prisma.transaction.update>[0]) =>
        prisma.transaction.update({ ...args, data: { ...args.data, userId } }),
      delete: (args: Parameters<typeof prisma.transaction.delete>[0]) =>
        prisma.transaction.delete(args),
    },
    category: {
      findMany: (args?: Parameters<typeof prisma.category.findMany>[0]) =>
        prisma.category.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.category.create>[0]) =>
        prisma.category.create({ ...args, data: { ...args.data, userId } }),
      update: (args: Parameters<typeof prisma.category.update>[0]) =>
        prisma.category.update({ ...args, data: { ...args.data, userId } }),
      delete: (args: Parameters<typeof prisma.category.delete>[0]) =>
        prisma.category.delete(args),
    },
    creditCard: {
      findMany: (args?: Parameters<typeof prisma.creditCard.findMany>[0]) =>
        prisma.creditCard.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.creditCard.create>[0]) =>
        prisma.creditCard.create({ ...args, data: { ...args.data, userId } }),
    },
    budget: {
      findMany: (args?: Parameters<typeof prisma.budget.findMany>[0]) =>
        prisma.budget.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.budget.create>[0]) =>
        prisma.budget.create({ ...args, data: { ...args.data, userId } }),
    },
    asset: {
      findMany: (args?: Parameters<typeof prisma.asset.findMany>[0]) =>
        prisma.asset.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.asset.create>[0]) =>
        prisma.asset.create({ ...args, data: { ...args.data, userId } }),
    },
    investmentTransaction: {
      findMany: (args?: Parameters<typeof prisma.investmentTransaction.findMany>[0]) =>
        prisma.investmentTransaction.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.investmentTransaction.create>[0]) =>
        prisma.investmentTransaction.create({ ...args, data: { ...args.data, userId } }),
    },
    alert: {
      findMany: (args?: Parameters<typeof prisma.alert.findMany>[0]) =>
        prisma.alert.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.alert.create>[0]) =>
        prisma.alert.create({ ...args, data: { ...args.data, userId } }),
    },
    notification: {
      findMany: (args?: Parameters<typeof prisma.notification.findMany>[0]) =>
        prisma.notification.findMany({ ...args, where: { userId, ...args?.where } }),
      update: (args: Parameters<typeof prisma.notification.update>[0]) =>
        prisma.notification.update(args),
    },
  }
}
