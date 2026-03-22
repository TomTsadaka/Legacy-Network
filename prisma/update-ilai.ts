import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating עילאי birthdate to 18.11.2022...');

  const updated = await prisma.child.update({
    where: { id: 'ilai-id' },
    data: {
      birthDate: new Date('2022-11-18'),
    },
  });

  console.log('✅ Updated עילאי:');
  console.log('   Name:', updated.name);
  console.log('   Birthdate:', updated.birthDate.toLocaleDateString('he-IL'));
  console.log('\n🎉 Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
