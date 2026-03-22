import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/entries/[id]/versions - Get version history
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

    // Get entry
    const entry = await prisma.entry.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        eventDate: true,
        location: true,
        category: true,
        createdAt: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Get all versions
    const versions = await prisma.entryVersion.findMany({
      where: { entryId: id },
      include: {
        editor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    });

    // Build timeline: current + all versions
    const timeline = [
      {
        version: versions.length + 1,
        isCurrent: true,
        title: entry.title,
        content: entry.content,
        eventDate: entry.eventDate,
        location: entry.location,
        category: entry.category,
        editedAt: entry.createdAt,
        editedBy: null, // Current version doesn't have editor info in this context
      },
      ...versions.map((v) => ({
        version: v.version,
        isCurrent: false,
        title: v.title,
        content: v.content,
        eventDate: v.eventDate,
        location: v.location,
        category: v.category,
        editedAt: v.editedAt,
        editedBy: {
          id: v.editor.id,
          name: v.editor.name || v.editor.email,
        },
      })),
    ];

    return NextResponse.json({
      entry: {
        id: entry.id,
        currentTitle: entry.title,
      },
      timeline,
      totalVersions: timeline.length,
    });
  } catch (error: any) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions', details: error.message },
      { status: 500 }
    );
  }
}
