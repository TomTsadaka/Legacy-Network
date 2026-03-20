import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@legacy.network'
  const password = 'password123'  // Simple password for testing

  console.log('🔄 Updating admin password...\n')

  const hashedPassword = await bcrypt.hash(password, 12)
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  console.log('✅ Password updated!\n')
  console.log('═══════════════════════════════════')
  console.log('📧 Email:    ', email)
  console.log('🔑 Password: ', password)
  console.log('═══════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
