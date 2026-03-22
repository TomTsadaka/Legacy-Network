import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for Tom...');

  // Hash password
  const hashedPassword = await bcrypt.hash('tom123', 10);

  // Create Tom's account (SUPER_ADMIN)
  const tom = await prisma.user.upsert({
    where: { email: 'tom@legacy-network.com' },
    update: {},
    create: {
      email: 'tom@legacy-network.com',
      username: 'tom',
      password: hashedPassword,
      name: 'Tom Tsadaka',
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created Tom:', {
    id: tom.id,
    email: tom.email,
    username: tom.username,
    role: tom.role,
  });

  // Create Tom's family
  const family = await prisma.family.upsert({
    where: { id: 'tom-family' },
    update: {},
    create: {
      id: 'tom-family',
      name: 'משפחת צדקה',
      members: {
        create: {
          userId: tom.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log('✅ Created family:', family.name);

  console.log('\n🎉 Seed completed!');
  console.log('\n📝 Login credentials:');
  console.log('   Username: tom');
  console.log('   Password: tom123');
  console.log('   Email: tom@legacy-network.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
