import { prisma } from './prisma';

export async function getMainLieuImage() {
  return prisma.lieu.findFirst({ where: { isMain: true } });
}
