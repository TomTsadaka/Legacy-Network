const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'demo' }
  });
  console.log('User found:', user);
  
  if (user) {
    console.log('\nPassword hash:', user.password);
    console.log('Role:', user.role);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
