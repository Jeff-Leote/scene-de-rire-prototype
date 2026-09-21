import { prisma } from './prisma';

export async function getMainLieuImage() {
  return prisma.lieu.findFirst({ where: { isMain: true } });
}

export async function getGalleryLieuImages() {
  return prisma.lieu.findMany({ where: { isMain: false }, orderBy: { id: 'asc' } });
}
