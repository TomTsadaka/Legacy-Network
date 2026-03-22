import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding עילאי and רוי...');

  // Find Tom's family
  const family = await prisma.family.findFirst({
    where: {
      name: 'משפחת צדקה',
    },
  });

  if (!family) {
    console.error('❌ Family not found!');
    return;
  }

  // Add עילאי
  const ilai = await prisma.child.upsert({
    where: { id: 'ilai-id' },
    update: {},
    create: {
      id: 'ilai-id',
      name: 'עילאי',
      birthDate: new Date('2020-01-15'), // Update with real birthdate
      gender: 'MALE',
      familyId: family.id,
    },
  });

  console.log('✅ Added עילאי:', ilai.name);

  // Add רוי
  const roy = await prisma.child.upsert({
    where: { id: 'roy-id' },
    update: {},
    create: {
      id: 'roy-id',
      name: 'רוי',
      birthDate: new Date('2022-06-10'), // Update with real birthdate
      gender: 'MALE',
      familyId: family.id,
    },
  });

  console.log('✅ Added רוי:', roy.name);
  console.log('\n🎉 Done! עילאי and רוי added successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
