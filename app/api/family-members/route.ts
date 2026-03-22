import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/family-members - Add child or family member
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, birthDate, gender, familyId } = body;

    if (!name || !birthDate || !familyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check access
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create child
    const child = await prisma.child.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        gender: gender || null,
        familyId,
      },
    });

    return NextResponse.json({
      success: true,
      child,
      message: 'הוסף בהצלחה!',
    });
  } catch (error) {
    console.error('Error creating family member:', error);
    return NextResponse.json(
      { error: 'Failed to create family member' },
      { status: 500 }
    );
  }
}

// GET /api/family-members - Get all family members
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

    // Check access
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all children
    const children = await prisma.child.findMany({
      where: { familyId },
      orderBy: { birthDate: 'asc' },
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family members' },
      { status: 500 }
    );
  }
}
