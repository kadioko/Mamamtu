require('dotenv/config');
const { PrismaClient, UserRole } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

function getDatabaseUrlForPgAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const url = new URL(databaseUrl);
  if (url.searchParams.get('sslmode') === 'require' && !url.searchParams.has('uselibpqcompat')) {
    url.searchParams.set('uselibpqcompat', 'true');
  }
  return url.toString();
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrlForPgAdapter(), max: 1 }),
});

async function upsertStaffUser({ email, name, role, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email,
      name,
      role,
      hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
    select: {
      email: true,
      name: true,
      role: true,
    },
  });
}

async function main() {
  const password = process.env.SEED_STAFF_PASSWORD || 'Demo2025!';
  const users = [];
  users.push(await upsertStaffUser({
      email: process.env.SEED_ADMIN_EMAIL || 'admin@mama-tu.health',
      name: 'Dr. Amina Hassan',
      role: UserRole.ADMIN,
      password,
    }));
  users.push(await upsertStaffUser({
      email: process.env.SEED_PROVIDER_EMAIL || 'provider@mama-tu.health',
      name: 'Dr. Omar Al-Sayed',
      role: UserRole.HEALTHCARE_PROVIDER,
      password,
    }));
  users.push(await upsertStaffUser({
      email: process.env.SEED_RECEPTION_EMAIL || 'reception@mama-tu.health',
      name: 'Sarah Johnson',
      role: UserRole.RECEPTIONIST,
      password,
    }));

  console.table(users);
  console.log(`Staff users are ready. Default password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
