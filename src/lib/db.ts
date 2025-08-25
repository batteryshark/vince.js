import { PrismaClient } from '@prisma/client'
import { app } from './config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (!app.isProduction) globalForPrisma.prisma = prisma