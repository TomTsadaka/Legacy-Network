import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/entries/[id] - Get single entry
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        taggedChildren: {
          include: {
            child: true,
          },
        },
        family: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Calculate age at entry for each child
    const enrichedChildren = entry.taggedChildren.map((ec) => {
      const child = ec.child;
      const eventDate = new Date(entry.eventDate);
      const birthDate = new Date(child.birthDate);
      
      let ageYears = eventDate.getFullYear() - birthDate.getFullYear();
      let ageMonths = eventDate.getMonth() - birthDate.getMonth();
      
      if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
      }

      let ageAtEntry = '';
      if (ageYears > 0) {
        ageAtEntry = `${ageYears} שנים`;
        if (ageMonths > 0) {
          ageAtEntry += ` ו-${ageMonths} חודשים`;
        }
      } else if (ageMonths > 0) {
        ageAtEntry = `${ageMonths} חודשים`;
      } else {
        const ageDays = Math.floor(
          (eventDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        ageAtEntry = `${ageDays} ימים`;
      }

      return {
        id: child.id,
        name: child.name,
        birthDate: child.birthDate,
        ageAtEntry,
      };
    });

    return NextResponse.json({
      entry: {
        ...entry,
        children: enrichedChildren,
      },
    });
  } catch (error: any) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry', details: error.message },
      { status: 500 }
    );
  }
}
