import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const childSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

const childrenBatchSchema = z.object({
  familyId: z.string(),
  children: z.array(childSchema).min(1, 'At least one child required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { familyId, children } = childrenBatchSchema.parse(body);

    // Verify user belongs to this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: session.user.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: 'You do not have access to this family' },
        { status: 403 }
      );
    }

    // Create children
    const createdChildren = await prisma.$transaction(
      children.map((child) =>
        prisma.child.create({
          data: {
            name: child.name,
            birthDate: new Date(child.birthDate),
            gender: child.gender,
            familyId,
          },
        })
      )
    );

    return NextResponse.json({
      children: createdChildren,
      message: `${createdChildren.length} child(ren) added successfully`,
    });
  } catch (error) {
    console.error('Add children error:', error);

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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json(
        { error: 'familyId required' },
        { status: 400 }
      );
    }

    // Verify access
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: session.user.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get children
    const children = await prisma.child.findMany({
      where: { familyId },
      orderBy: { birthDate: 'desc' },
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Get children error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
