const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://neondb_owner:npg_kEti29GpzcvK@ep-twilight-shape-anvotk09-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Creating Tom in production database...');

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('tom123', 10);

    // Create Tom
    const tom = await prisma.user.upsert({
      where: { email: 'tom@legacy-network.com' },
      update: {
        username: 'tom',
        password: hashedPassword,
        name: 'Tom Tsadaka',
        role: 'SUPER_ADMIN',
      },
      create: {
        email: 'tom@legacy-network.com',
        username: 'tom',
        password: hashedPassword,
        name: 'Tom Tsadaka',
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Created/Updated Tom:', {
      id: tom.id,
      email: tom.email,
      username: tom.username,
      role: tom.role,
    });

    // Create family
    const family = await prisma.family.upsert({
      where: { id: 'tom-family-production' },
      update: {},
      create: {
        id: 'tom-family-production',
        name: 'משפחת צדקה',
      },
    });

    console.log('✅ Created family:', family.name);

    // Link Tom to family
    const membership = await prisma.familyMember.upsert({
      where: {
        userId_familyId: {
          userId: tom.id,
          familyId: family.id,
        },
      },
      update: {},
      create: {
        userId: tom.id,
        familyId: family.id,
        role: 'OWNER',
      },
    });

    console.log('✅ Linked Tom to family');

    console.log('\n🎉 Production seed completed!');
    console.log('\n📝 Login at: https://legacy-network-mu.vercel.app/auth/signin');
    console.log('   Username: tom');
    console.log('   Password: tom123');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
