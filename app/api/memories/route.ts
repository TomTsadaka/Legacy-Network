import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/memories - Fetch memories with filters
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
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
      where.children = { some: { id: childId } };
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

    // Fetch memories
    const [memories, total] = await Promise.all([
      prisma.memory.findMany({
        where,
        include: {
          children: {
            select: {
              id: true,
              name: true,
              birthDate: true,
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
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.memory.count({ where }),
    ]);

    // Calculate age at memory for each child
    const memoriesWithAge = memories.map((memory) => ({
      ...memory,
      children: memory.children.map((child) => {
        const ageMonths = calculateAgeInMonths(child.birthDate, memory.date);
        return {
          ...child,
          ageAtMemory: formatAge(ageMonths),
          ageMonths,
        };
      }),
    }));

    return NextResponse.json({
      memories: memoriesWithAge,
      total,
      hasMore: offset + memories.length < total,
    });
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}

// Helper: Calculate age in months
function calculateAgeInMonths(birthDate: Date, memoryDate: Date): number {
  const birth = new Date(birthDate);
  const memory = new Date(memoryDate);
  
  const years = memory.getFullYear() - birth.getFullYear();
  const months = memory.getMonth() - birth.getMonth();
  
  return years * 12 + months;
}

// Helper: Format age
function formatAge(months: number): string {
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
