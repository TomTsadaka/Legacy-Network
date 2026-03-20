import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@legacy.network'
  const password = 'Admin@2026!'
  const hashedPassword = await bcrypt.hash(password, 12)

  console.log('Creating Super Admin user...\n')

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('✅ Admin user already exists!')
    console.log('\n═══════════════════════════════════')
    console.log('📧 Email:    ', email)
    console.log('🔑 Password: ', password)
    console.log('═══════════════════════════════════')
    return
  }

  // Create admin user with password
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      emailVerified: new Date(),
    }
  })

  // Create a family for the admin
  const family = await prisma.family.create({
    data: {
      name: 'Admin Family',
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        }
      }
    }
  })

  // Add some sample children
  await prisma.child.createMany({
    data: [
      {
        familyId: family.id,
        name: 'Emma Johnson',
        birthDate: new Date('2018-06-15'),
        gender: 'FEMALE',
      },
      {
        familyId: family.id,
        name: 'Noah Johnson',
        birthDate: new Date('2020-03-22'),
        gender: 'MALE',
      }
    ]
  })

  console.log('🎉 Super Admin Created Successfully!\n')
  console.log('═══════════════════════════════════')
  console.log('📧 Email:    ', email)
  console.log('🔑 Password: ', password)
  console.log('═══════════════════════════════════')
  console.log('\n⚠️  Save these credentials securely!')
  console.log('\n🌐 Login at:')
  console.log('   • Production: https://legacy-network-mu.vercel.app/auth/signin')
  console.log('   • Local:      http://localhost:3002/auth/signin\n')
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
