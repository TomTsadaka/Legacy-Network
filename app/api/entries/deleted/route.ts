import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/entries/deleted - Fetch deleted entries (trash/recycle bin)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json({ error: 'Family ID required' }, { status: 400 });
    }

    // Check user has access to this family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch deleted entries (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedEntries = await prisma.entry.findMany({
      where: {
        familyId,
        deletedAt: {
          not: null,
          gte: thirtyDaysAgo, // Only entries deleted in last 30 days
        },
      },
      include: {
        taggedChildren: {
          include: {
            child: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });

    return NextResponse.json({
      entries: deletedEntries,
      total: deletedEntries.length,
    });
  } catch (error: any) {
    console.error('Error fetching deleted entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted entries', details: error.message },
      { status: 500 }
    );
  }
}
