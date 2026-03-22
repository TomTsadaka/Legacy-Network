import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating רוי birthdate to 15.1.2024...');

  const updated = await prisma.child.update({
    where: { id: 'roy-id' },
    data: {
      birthDate: new Date('2024-01-15'),
    },
  });

  console.log('✅ Updated רוי:');
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
