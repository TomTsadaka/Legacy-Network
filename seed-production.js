const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production seed...');

  // Delete existing demo user if exists
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'demo@legacy-network.com' },
        { username: 'demo' }
      ]
    }
  });

  console.log('🗑️ Deleted old demo user');

  // Hash password for demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Create demo SUPER_ADMIN user
  const demoAdmin = await prisma.user.create({
    data: {
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

  // Check if demo family already exists
  let demoFamily = await prisma.family.findUnique({
    where: { id: 'demo-family-id' }
  });

  if (!demoFamily) {
    demoFamily = await prisma.family.create({
      data: {
        id: 'demo-family-id',
        name: 'משפחת דמו',
      },
    });
  }

  // Create family member relationship
  await prisma.familyMember.deleteMany({
    where: {
      userId: demoAdmin.id,
      familyId: demoFamily.id
    }
  });

  await prisma.familyMember.create({
    data: {
      userId: demoAdmin.id,
      familyId: demoFamily.id,
      role: 'OWNER',
    },
  });

  console.log('✅ Created/updated demo family');

  // Create demo children if they don't exist
  const children = await prisma.child.findMany({
    where: { familyId: demoFamily.id }
  });

  if (children.length === 0) {
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

    console.log('✅ Created demo children');

    // Create demo entries
    const entries = await prisma.entry.findMany({
      where: { familyId: demoFamily.id }
    });

    if (entries.length === 0) {
      await prisma.entry.create({
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

      await prisma.entry.create({
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

      console.log('✅ Created demo entries');
    }
  }

  console.log('\n🎉 Production seed completed successfully!');
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
