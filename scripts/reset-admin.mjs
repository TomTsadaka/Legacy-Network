import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@legacy.network'
  const password = 'Admin@2026!'

  console.log('🔄 Resetting admin user...\n')

  // Delete existing user
  try {
    await prisma.user.delete({
      where: { email }
    })
    console.log('✅ Deleted existing user')
  } catch (e) {
    console.log('ℹ️  No existing user to delete')
  }

  // Create fresh admin
  const hashedPassword = await bcrypt.hash(password, 12)
  
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created admin user:', user.id)

  // Create family
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

  console.log('✅ Created family:', family.id)

  // Add sample children
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

  console.log('✅ Created sample children')

  console.log('\n🎉 Admin user reset successfully!\n')
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
  .finally(async () => {
    await prisma.$disconnect()
  })
