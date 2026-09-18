import { PrismaClient } from '@prisma/client';

// Un seul client Prisma réutilisé entre les rechargements à chaud en dev,
// sinon chaque hot-reload ouvrirait une nouvelle connexion à la base.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
