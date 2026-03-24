const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    console.log('User details:', JSON.stringify(users, null, 2));
    
    const families = await prisma.family.findMany();
    console.log('\nFamilies:', families.length);
    console.log('Family details:', JSON.stringify(families, null, 2));
    
    const children = await prisma.child.findMany();
    console.log('\nChildren:', children.length);
    console.log('Children details:', JSON.stringify(children, null, 2));
    
    const entries = await prisma.entry.findMany();
    console.log('\nEntries:', entries.length);
    console.log('Entry details:', JSON.stringify(entries, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
