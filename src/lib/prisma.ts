import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getDatabaseUrlForPgAdapter } from '@/lib/databaseUrl';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabasePoolMax() {
  const configuredMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? '', 10);
  return Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : 1;
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrlForPgAdapter(),
    max: getDatabasePoolMax(),
  });

  return new PrismaClient({
    adapter,
    log: process.env.PRISMA_QUERY_LOGS === 'true'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  });
}

export const prisma =
  globalForPrisma.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
