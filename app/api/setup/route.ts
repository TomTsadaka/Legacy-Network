import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// One-time setup endpoint
// Visit: https://legacy-network-mu.vercel.app/api/setup
export async function GET() {
  try {
    // Check if Tom already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'tom@legacy-network.com' },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Tom already exists! You can sign in now.',
        user: {
          username: existing.username,
          email: existing.email,
          role: existing.role,
        },
      });
    }

    // Create Tom
    const hashedPassword = await bcrypt.hash('tom123', 10);
    
    const tom = await prisma.user.create({
      data: {
        email: 'tom@legacy-network.com',
        username: 'tom',
        password: hashedPassword,
        name: 'Tom Tsadaka',
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
      },
    });

    // Create family
    const family = await prisma.family.create({
      data: {
        id: 'tom-family',
        name: 'משפחת צדקה',
        members: {
          create: {
            userId: tom.id,
            role: 'OWNER',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: '✅ Setup complete! You can now sign in.',
      credentials: {
        username: 'tom',
        password: 'tom123',
        url: '/auth/signin',
      },
      user: {
        id: tom.id,
        email: tom.email,
        username: tom.username,
        role: tom.role,
      },
      family: {
        id: family.id,
        name: family.name,
      },
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: 'Check Vercel logs for details',
      },
      { status: 500 }
    );
  }
}
