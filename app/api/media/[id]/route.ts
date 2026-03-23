import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { del } from '@vercel/blob';

// DELETE /api/media/[id] - Delete media file
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

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(media.url);
    } catch (error) {
      console.error('Error deleting from blob storage:', error);
      // Continue anyway - database cleanup is more important
    }

    // Delete database record
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media', details: error.message },
      { status: 500 }
    );
  }
}
