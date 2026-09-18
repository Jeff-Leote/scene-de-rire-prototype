import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const spectacleCount = await prisma.spectacle.count();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">L&apos;Espace Comédie Lille</h1>
      <p className="text-gray-400">Squelette Next.js + Prisma en place.</p>
      <p className="text-sm text-gray-500">
        {spectacleCount} spectacle{spectacleCount > 1 ? 's' : ''} en base.
      </p>
    </main>
  );
}
