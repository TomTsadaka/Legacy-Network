import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large uploads

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Upload each file to Vercel Blob
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const blob = await put(file.name, file, {
          access: 'public',
          addRandomSuffix: true,
        });

        return {
          url: blob.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO',
        };
      })
    );

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
