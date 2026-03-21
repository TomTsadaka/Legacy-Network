import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Create demo SUPER_ADMIN user
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'demo@legacy-network.com' },
    update: {},
    create: {
      email: 'demo@legacy-network.com',
      username: 'demo',
      password: hashedPassword,
      name: 'Demo Admin',
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created demo admin user:', {
    id: demoAdmin.id,
    email: demoAdmin.email,
    username: demoAdmin.username,
    role: demoAdmin.role,
  });

  // Create demo family for the admin
  const demoFamily = await prisma.family.upsert({
    where: { id: 'demo-family-id' },
    update: {},
    create: {
      id: 'demo-family-id',
      name: 'משפחת דמו',
      members: {
        create: {
          userId: demoAdmin.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log('✅ Created demo family:', {
    id: demoFamily.id,
    name: demoFamily.name,
  });

  // Create demo children
  const child1 = await prisma.child.create({
    data: {
      name: 'נועה',
      birthDate: new Date('2020-05-15'),
      gender: 'FEMALE',
      familyId: demoFamily.id,
    },
  });

  const child2 = await prisma.child.create({
    data: {
      name: 'יונתן',
      birthDate: new Date('2022-08-22'),
      gender: 'MALE',
      familyId: demoFamily.id,
    },
  });

  console.log('✅ Created demo children:', [
    { name: child1.name, birthDate: child1.birthDate },
    { name: child2.name, birthDate: child2.birthDate },
  ]);

  // Create demo entries
  const entry1 = await prisma.entry.create({
    data: {
      title: 'הצעד הראשון של נועה',
      content: 'היום נועה עשתה את הצעד הראשון שלה! היא כל כך גאה בעצמה 🎉',
      eventDate: new Date('2021-03-10'),
      category: 'MILESTONE',
      visibility: 'FAMILY_ONLY',
      authorId: demoAdmin.id,
      familyId: demoFamily.id,
      taggedChildren: {
        create: {
          childId: child1.id,
        },
      },
    },
  });

  const entry2 = await prisma.entry.create({
    data: {
      title: 'יום הולדת ראשון ליונתן',
      content: 'חגגנו את יום ההולדת הראשון של יונתן. הוא היה כל כך חמוד עם העוגה! 🎂',
      eventDate: new Date('2023-08-22'),
      category: 'SPECIAL_EVENT',
      visibility: 'FAMILY_ONLY',
      authorId: demoAdmin.id,
      familyId: demoFamily.id,
      taggedChildren: {
        create: {
          childId: child2.id,
        },
      },
    },
  });

  console.log('✅ Created demo entries:', [
    { title: entry1.title },
    { title: entry2.title },
  ]);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Demo login credentials:');
  console.log('   Username: demo');
  console.log('   Password: demo123');
  console.log('   Email: demo@legacy-network.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
