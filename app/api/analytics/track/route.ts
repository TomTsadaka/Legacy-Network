import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    const session = await auth();
    const userAgent = request.headers.get('user-agent');

    // Track the page view
    await prisma.pageView.create({
      data: {
        path,
        userId: session?.user?.email || null,
        userAgent: userAgent || null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
