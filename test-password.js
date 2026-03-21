const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'demo' }
  });
  
  if (!user) {
    console.log('❌ User not found!');
    return;
  }
  
  console.log('✅ User found:', {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    hasPassword: !!user.password,
  });
  
  if (!user.password) {
    console.log('❌ User has no password!');
    return;
  }
  
  // Test the password
  const testPassword = 'demo123';
  const isValid = await bcrypt.compare(testPassword, user.password);
  
  console.log('\n🔑 Password test:');
  console.log('   Input:', testPassword);
  console.log('   Hash:', user.password);
  console.log('   Valid:', isValid);
  
  if (!isValid) {
    console.log('\n🔧 Creating new hash...');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('   New hash:', newHash);
    
    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    });
    
    console.log('✅ Password updated!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
