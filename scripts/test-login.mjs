import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@legacy.network'
  const password = 'Admin@2026!'

  console.log('🔍 Testing login credentials...\n')

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log('❌ User not found!')
    return
  }

  console.log('✅ User found:', user.id)
  console.log('   Email:', user.email)
  console.log('   Name:', user.name)
  console.log('   Has password:', !!user.password)

  if (!user.password) {
    console.log('❌ User has no password!')
    return
  }

  console.log('\n🔐 Testing password...')
  const isValid = await bcrypt.compare(password, user.password)

  if (isValid) {
    console.log('✅ Password is CORRECT!')
  } else {
    console.log('❌ Password is WRONG!')
    console.log('\nℹ️  Expected password:', password)
    console.log('ℹ️  Hash in DB:', user.password.substring(0, 20) + '...')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
