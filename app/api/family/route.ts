import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const familySchema = z.object({
  name: z.string().min(1, 'Family name is required').max(100),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate input
    const body = await req.json();
    const { name } = familySchema.parse(body);

    // Check if user already has a family
    const existingMembership = await prisma.familyMember.findFirst({
      where: { userId: session.user.id },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User already belongs to a family' },
        { status: 400 }
      );
    }

    // Create family and add user as OWNER
    const family = await prisma.family.create({
      data: {
        name,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return NextResponse.json({
      familyId: family.id,
      message: 'Family created successfully',
    });
  } catch (error) {
    console.error('Family creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's families
    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            entries: true,
          },
        },
      },
    });

    return NextResponse.json({ families });
  } catch (error) {
    console.error('Get families error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
