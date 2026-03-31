import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// PUT /api/admin/users/[id]/role - Update user role
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    });

    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'רק מנהל על יכול לשנות הרשאות' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { role } = await request.json();

    // Validate role
    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'תפקיד לא תקין' },
        { status: 400 }
      );
    }

    // Prevent admin from demoting themselves
    if (id === currentUser.id && role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'לא ניתן להוריד את ההרשאות של עצמך' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: role === UserRole.SUPER_ADMIN 
        ? 'המשתמש הועלה למנהל על בהצלחה!'
        : 'ההרשאות עודכנו בהצלחה',
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'שגיאה בעדכון ההרשאות', details: error.message },
      { status: 500 }
    );
  }
}
