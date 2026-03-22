import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/entries - Fetch entries with filters
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const childId = searchParams.get('childId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Build where clause
    const where: any = { familyId };

    if (childId) {
      where.taggedChildren = { some: { childId } };
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch entries
    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        include: {
          taggedChildren: {
            include: {
              child: {
                select: {
                  id: true,
                  name: true,
                  birthDate: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { eventDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.entry.count({ where }),
    ]);

    // Calculate age at entry for each child
    const entriesWithAge = entries.map((entry) => ({
      ...entry,
      children: entry.taggedChildren.map(({ child }) => {
        const ageMonths = calculateAgeInMonths(child.birthDate, entry.eventDate);
        return {
          ...child,
          ageAtEntry: formatAge(ageMonths),
          ageMonths,
        };
      }),
    }));

    return NextResponse.json({
      entries: entriesWithAge,
      total,
      hasMore: offset + entries.length < total,
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// Helper: Calculate age in months
function calculateAgeInMonths(birthDate: Date, eventDate: Date): number {
  const birth = new Date(birthDate);
  const event = new Date(eventDate);
  
  const years = event.getFullYear() - birth.getFullYear();
  const months = event.getMonth() - birth.getMonth();
  
  return years * 12 + months;
}

// Helper: Format age
function formatAge(months: number): string {
  if (months < 0) return 'טרם נולד';
  if (months < 12) {
    return `${months} חודשים`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} שנים`;
  }
  
  return `${years} שנים ו-${remainingMonths} חודשים`;
}
