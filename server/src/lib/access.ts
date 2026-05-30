import type { PrismaClient } from '@prisma/client'

export async function userHasListAccess(
  prisma: PrismaClient,
  userId: string,
  listId: string,
): Promise<boolean> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      household: { include: { members: true } },
      members: true,
    },
  })
  if (!list) return false

  const isHouseholdMember = list.household.members.some((m) => m.userId === userId)
  if (isHouseholdMember) return true

  return list.members.some((m) => m.userId === userId)
}

export async function userHasHouseholdAccess(
  prisma: PrismaClient,
  userId: string,
  householdId: string,
): Promise<boolean> {
  const member = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
  })
  return !!member
}

export async function requireListAccess(
  prisma: PrismaClient,
  userId: string,
  listId: string,
): Promise<{ householdId: string }> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      household: { include: { members: true } },
      members: true,
    },
  })
  if (!list) {
    throw new AccessError('List not found', 404)
  }

  const hasAccess =
    list.household.members.some((m) => m.userId === userId) ||
    list.members.some((m) => m.userId === userId)

  if (!hasAccess) {
    throw new AccessError('Access denied', 403)
  }

  return { householdId: list.householdId }
}

export async function requireHouseholdAccess(
  prisma: PrismaClient,
  userId: string,
  householdId: string,
): Promise<void> {
  const hasAccess = await userHasHouseholdAccess(prisma, userId, householdId)
  if (!hasAccess) {
    throw new AccessError('Access denied', 403)
  }
}

export class AccessError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}
