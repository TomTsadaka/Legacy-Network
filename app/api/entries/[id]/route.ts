import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function createVersion(entryId: string, userId: string) {
  // Get current entry state
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
  });

  if (!entry) return;

  // Get latest version number
  const latestVersion = await prisma.entryVersion.findFirst({
    where: { entryId },
    orderBy: { version: 'desc' },
  });

  const nextVersion = (latestVersion?.version || 0) + 1;

  // Create version snapshot
  await prisma.entryVersion.create({
    data: {
      entryId,
      version: nextVersion,
      title: entry.title,
      content: entry.content,
      eventDate: entry.eventDate,
      location: entry.location,
      category: entry.category,
      editedBy: userId,
    },
  });
}

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

// PATCH /api/entries/[id] - Update entry
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, eventDate, location, category, childrenIds } = body;

    // Check if entry exists and user has permission
    const existingEntry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Create version snapshot before updating
    await createVersion(id, session.user.id as string);

    // Update entry
    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        title,
        content,
        eventDate: new Date(eventDate),
        location,
        category,
      },
    });

    // Update tagged children if provided
    if (childrenIds) {
      // Remove existing tags
      await prisma.entryChild.deleteMany({
        where: { entryId: id },
      });

      // Add new tags
      if (childrenIds.length > 0) {
        await prisma.entryChild.createMany({
          data: childrenIds.map((childId: string) => ({
            entryId: id,
            childId,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
    });
  } catch (error: any) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/entries/[id] - Delete entry
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if entry exists
    const entry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Delete entry (cascade will delete versions, tags, etc.)
    await prisma.entry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry', details: error.message },
      { status: 500 }
    );
  }
}
