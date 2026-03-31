'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart3, TrendingUp, Eye, Calendar } from 'lucide-react';

type AnalyticsData = {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  topPages: { path: string; views: number }[];
  viewsByHour: { hour: number; views: number }[];
};

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      checkAccess();
    }
  }, [status]);

  async function checkAccess() {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      if (meData.user?.role !== 'SUPER_ADMIN') {
        router.push('/timeline');
        return;
      }

      await loadAnalytics();
    } catch (error) {
      console.error('Error checking access:', error);
      router.push('/timeline');
    }
  }

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/stats');
      const data = await res.json();
      
      if (data.totalViews !== undefined) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-8 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-700 font-bold text-lg">טוען נתונים סטטיסטיים...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">שגיאה בטעינת הנתונים</p>
      </div>
    );
  }

  const maxHourlyViews = Math.max(...analytics.viewsByHour.map(h => h.views), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            סטטיסטיקות אתר 📊
          </h1>
          <p className="text-gray-600">מעקב אחר כניסות וצפיות באתר</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-6 h-6 text-blue-600" />
              <div className="text-sm text-gray-600 font-bold">סה״כ צפיות</div>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {analytics.totalViews.toLocaleString('he-IL')}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div className="text-sm text-gray-600 font-bold">צפיות היום</div>
            </div>
            <div className="text-4xl font-bold text-green-600">
              {analytics.todayViews.toLocaleString('he-IL')}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-orange-600" />
              <div className="text-sm text-gray-600 font-bold">צפיות השבוע</div>
            </div>
            <div className="text-4xl font-bold text-orange-600">
              {analytics.weekViews.toLocaleString('he-IL')}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              <div className="text-sm text-gray-600 font-bold">צפיות החודש</div>
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {analytics.monthViews.toLocaleString('he-IL')}
            </div>
          </div>
        </div>

        {/* Views by Hour (Last 24h) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">צפיות ב-24 השעות האחרונות</h2>
          <div className="flex items-end gap-1 h-48">
            {analytics.viewsByHour.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${(item.views / maxHourlyViews) * 100}%`,
                    minHeight: item.views > 0 ? '4px' : '0'
                  }}
                  title={`${item.hour}:00 - ${item.views} צפיות`}
                />
                {index % 2 === 0 && (
                  <div className="text-xs text-gray-500 mt-2">{item.hour}</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">שעות (24 האחרונות)</div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">דפים פופולריים 🔥</h2>
          <div className="space-y-3">
            {analytics.topPages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין נתונים עדיין</p>
            ) : (
              analytics.topPages.map((page, index) => {
                const maxViews = analytics.topPages[0]?.views || 1;
                const percentage = (page.views / maxViews) * 100;
                
                return (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-sm text-gray-700 truncate max-w-md">
                        {page.path}
                      </span>
                      <span className="font-bold text-blue-600 ml-4">
                        {page.views.toLocaleString('he-IL')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Back Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:shadow-lg transition-shadow"
          >
            👥 ניהול משתמשים
          </button>
          <button
            onClick={() => router.push('/timeline')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full hover:shadow-lg transition-shadow"
          >
            ← חזרה לטיימליין
          </button>
        </div>
      </div>
    </div>
  );
}
