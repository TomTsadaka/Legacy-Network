import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@legacy.network' }
  })

  if (user) {
    console.log('✅ User found!')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Has password:', !!user.password)
    console.log('Password hash length:', user.password?.length)
  } else {
    console.log('❌ User not found')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
