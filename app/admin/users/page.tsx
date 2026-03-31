'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type User = {
  id: string;
  username: string | null;
  email: string;
  name: string | null;
  role: 'USER' | 'SUPER_ADMIN';
  createdAt: string;
  _count: {
    entries: number;
    families: number;
  };
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [changingRole, setChangingRole] = useState<string | null>(null);

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
      // Check if user is admin
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      if (meData.user?.role !== 'SUPER_ADMIN') {
        router.push('/timeline');
        return;
      }

      setCurrentUserId(meData.user.id);
      
      // Load users
      await loadUsers();
    } catch (error) {
      console.error('Error checking access:', error);
      router.push('/timeline');
    }
  }

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN';
    
    const confirmed = confirm(
      newRole === 'SUPER_ADMIN'
        ? '️האם להעניק הרשאות מנהל על למשתמש זה? 👑'
        : 'האם להוריד הרשאות מנהל מהמשתמש? ⚠️'
    );

    if (!confirmed) return;

    try {
      setChangingRole(userId);
      
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'שגיאה בעדכון ההרשאות');
        return;
      }

      alert(data.message || 'ההרשאות עודכנו בהצלחה!');
      await loadUsers();
      
    } catch (error) {
      console.error('Error updating role:', error);
      alert('שגיאה בעדכון ההרשאות');
    } finally {
      setChangingRole(null);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-8 border-purple-200 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-700 font-bold text-lg">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  const totalEntries = users.reduce((sum, u) => sum + u._count.entries, 0);
  const totalAdmins = users.filter(u => u.role === 'SUPER_ADMIN').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            ניהול משתמשים 👥
          </h1>
          <p className="text-gray-600">סה״כ {users.length} משתמשים במערכת</p>
        </div>

        {/* Users Table - Mobile Responsive */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold">שם משתמש</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">שם מלא</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">אימייל</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">תפקיד</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">זיכרונות</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">משפחות</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">תאריך הצטרפות</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr 
                    key={user.id}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-blue-600">
                        {user.username || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-right" dir="ltr">
                      <a 
                        href={`mailto:${user.email}`}
                        className="text-cyan-600 hover:text-cyan-800 hover:underline"
                      >
                        {user.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'SUPER_ADMIN' ? '👑 אדמין' : 'משתמש'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold">
                        {user._count.entries}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold">
                        {user._count.families}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        disabled={changingRole === user.id || user.id === currentUserId}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                          user.id === currentUserId
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : user.role === 'SUPER_ADMIN'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        } ${changingRole === user.id ? 'opacity-50' : ''}`}
                      >
                        {changingRole === user.id ? '...' : (
                          user.role === 'SUPER_ADMIN' ? 'הורד הרשאות' : 'העלה לאדמין 👑'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-blue-600 text-lg">
                      {user.username || user.name || 'משתמש'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1" dir="ltr">
                      {user.email}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === 'SUPER_ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'SUPER_ADMIN' ? '👑 אדמין' : 'משתמש'}
                  </span>
                </div>

                <div className="flex gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">{user._count.entries}</span>
                    <span className="text-gray-600">זיכרונות</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">{user._count.families}</span>
                    <span className="text-gray-600">משפחות</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  הצטרף: {new Date(user.createdAt).toLocaleDateString('he-IL')}
                </div>

                <button
                  onClick={() => toggleRole(user.id, user.role)}
                  disabled={changingRole === user.id || user.id === currentUserId}
                  className={`w-full px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    user.id === currentUserId
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : user.role === 'SUPER_ADMIN'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  } ${changingRole === user.id ? 'opacity-50' : ''}`}
                >
                  {changingRole === user.id ? 'מעדכן...' : (
                    user.role === 'SUPER_ADMIN' ? 'הורד הרשאות ⚠️' : 'העלה לאדמין 👑'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {users.length}
            </div>
            <div className="text-gray-600 font-bold">סה״כ משתמשים</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {totalEntries}
            </div>
            <div className="text-gray-600 font-bold">סה״כ זיכרונות</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {totalAdmins}
            </div>
            <div className="text-gray-600 font-bold">מנהלי מערכת 👑</div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <button
            onClick={() => router.push('/admin/analytics')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:shadow-lg transition-shadow"
          >
            📊 סטטיסטיקות אתר
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
