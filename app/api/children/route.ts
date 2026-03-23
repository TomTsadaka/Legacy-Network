import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/children - Get all children in user's families
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's families
    const familyMembers = await prisma.familyMember.findMany({
      where: { userId: session.user.id as string },
      include: {
        family: {
          include: {
            children: {
              orderBy: { birthDate: 'desc' },
            },
          },
        },
      },
    });

    // Flatten children from all families
    const allChildren = familyMembers.flatMap((fm) => fm.family.children);

    // Remove duplicates (in case user is in multiple families with same children)
    const uniqueChildren = allChildren.filter(
      (child, index, self) => self.findIndex((c) => c.id === child.id) === index
    );

    return NextResponse.json({
      children: uniqueChildren,
    });
  } catch (error: any) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children', details: error.message },
      { status: 500 }
    );
  }
}
