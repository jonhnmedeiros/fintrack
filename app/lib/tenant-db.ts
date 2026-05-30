import { prisma } from './db'

export function userDb(userId: string) {

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
      delete: (args: Parameters<typeof prisma.creditCard.delete>[0]) =>
        prisma.creditCard.delete(args),
    },
    budget: {
      findMany: (args?: Parameters<typeof prisma.budget.findMany>[0]) =>
        prisma.budget.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.budget.create>[0]) =>
        prisma.budget.create({ ...args, data: { ...args.data, userId } }),
      upsert: (args: Parameters<typeof prisma.budget.upsert>[0]) =>
        prisma.budget.upsert(args),
      delete: (args: Parameters<typeof prisma.budget.delete>[0]) =>
        prisma.budget.delete(args),
    },
    asset: {
      findMany: (args?: Parameters<typeof prisma.asset.findMany>[0]) =>
        prisma.asset.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.asset.create>[0]) =>
        prisma.asset.create({ ...args, data: { ...args.data, userId } }),
      delete: (args: Parameters<typeof prisma.asset.delete>[0]) =>
        prisma.asset.delete(args),
    },
    investmentTransaction: {
      findMany: (args?: Parameters<typeof prisma.investmentTransaction.findMany>[0]) =>
        prisma.investmentTransaction.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.investmentTransaction.create>[0]) =>
        prisma.investmentTransaction.create({ ...args, data: { ...args.data, userId } }),
      delete: (args: Parameters<typeof prisma.investmentTransaction.delete>[0]) =>
        prisma.investmentTransaction.delete(args),
    },
    alert: {
      findMany: (args?: Parameters<typeof prisma.alert.findMany>[0]) =>
        prisma.alert.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.alert.create>[0]) =>
        prisma.alert.create({ ...args, data: { ...args.data, userId } }),
      update: (args: Parameters<typeof prisma.alert.update>[0]) =>
        prisma.alert.update(args),
    },
    notification: {
      findMany: (args?: Parameters<typeof prisma.notification.findMany>[0]) =>
        prisma.notification.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.notification.create>[0]) =>
        prisma.notification.create({ ...args, data: { ...args.data, userId } }),
      update: (args: Parameters<typeof prisma.notification.update>[0]) =>
        prisma.notification.update(args),
    },
    invite: {
      create: (args: Parameters<typeof prisma.invite.create>[0]) =>
        prisma.invite.create({ ...args, data: { ...args.data, invitedById: userId } }),
      findMany: (args?: Parameters<typeof prisma.invite.findMany>[0]) =>
        prisma.invite.findMany({ ...args, where: { invitedById: userId, ...args?.where } }),
      update: (args: Parameters<typeof prisma.invite.update>[0]) =>
        prisma.invite.update(args),
    },
  }
}

export function getEffectiveUserId(user: { viewerOfId?: string | null; id: string }): string {
  return user.viewerOfId ?? user.id
}

/** @deprecated Use `getEffectiveUserId(session.user)` instead — it doesn't need a DB call */
export function viewerDb(userId: string) {
  return {
    findEffectiveUserId: async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { viewerOfId: true },
      })
      return user?.viewerOfId || userId
    },
  }
}
