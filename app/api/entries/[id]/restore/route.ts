import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/entries/[id]/restore - Restore a deleted entry
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if entry exists and is deleted
    const entry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    if (!entry.deletedAt) {
      return NextResponse.json({ error: 'Entry is not deleted' }, { status: 400 });
    }

    // Restore entry - clear deletion fields
    const restoredEntry = await prisma.entry.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Entry restored successfully',
      entry: restoredEntry,
    });
  } catch (error: any) {
    console.error('Error restoring entry:', error);
    return NextResponse.json(
      { error: 'Failed to restore entry', details: error.message },
      { status: 500 }
    );
  }
}
