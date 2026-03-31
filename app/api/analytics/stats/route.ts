import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'רק מנהל על יכול לראות נתונים סטטיסטיים' },
        { status: 403 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total views
    const totalViews = await prisma.pageView.count();

    // Today's views
    const todayViews = await prisma.pageView.count({
      where: {
        createdAt: { gte: today }
      }
    });

    // This week's views
    const weekViews = await prisma.pageView.count({
      where: {
        createdAt: { gte: thisWeek }
      }
    });

    // This month's views
    const monthViews = await prisma.pageView.count({
      where: {
        createdAt: { gte: thisMonth }
      }
    });

    // Top pages
    const topPagesRaw = await prisma.pageView.groupBy({
      by: ['path'],
      _count: {
        path: true
      },
      orderBy: {
        _count: {
          path: 'desc'
        }
      },
      take: 10
    });

    const topPages = topPagesRaw.map(item => ({
      path: item.path,
      views: item._count.path
    }));

    // Recent views (last 24 hours, grouped by hour)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentViews = await prisma.pageView.findMany({
      where: {
        createdAt: { gte: last24Hours }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        createdAt: true
      }
    });

    // Group by hour
    const viewsByHour = Array.from({ length: 24 }, (_, i) => {
      const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const count = recentViews.filter(
        v => v.createdAt >= hourStart && v.createdAt < hourEnd
      ).length;

      return {
        hour: hourStart.getHours(),
        views: count
      };
    });

    return NextResponse.json({
      totalViews,
      todayViews,
      weekViews,
      monthViews,
      topPages,
      viewsByHour
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת הנתונים הסטטיסטיים', details: error.message },
      { status: 500 }
    );
  }
}
