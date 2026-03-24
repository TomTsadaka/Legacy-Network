const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const familyMembers = await prisma.familyMember.findMany({
      include: {
        user: true,
        family: true
      }
    });
    
    console.log('Family Members:', familyMembers.length);
    console.log(JSON.stringify(familyMembers, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
