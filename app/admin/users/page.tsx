import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export default async function AdminUsersPage() {
  const session = await auth();
  
  // Only SUPER_ADMIN can access
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true }
  });

  if (currentUser?.role !== UserRole.SUPER_ADMIN) {
    redirect('/timeline');
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          entries: true,
          families: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            ניהול משתמשים 👥
          </h1>
          <p className="text-gray-600">סה״כ {users.length} משתמשים במערכת</p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
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
                        user.role === UserRole.SUPER_ADMIN
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === UserRole.SUPER_ADMIN ? 'אדמין' : 'משתמש'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {users.length}
            </div>
            <div className="text-gray-600 font-bold">סה״כ משתמשים</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {users.reduce((sum, u) => sum + u._count.entries, 0)}
            </div>
            <div className="text-gray-600 font-bold">סה״כ זיכרונות</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {users.filter(u => u.role === UserRole.SUPER_ADMIN).length}
            </div>
            <div className="text-gray-600 font-bold">מנהלי מערכת</div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <a
            href="/timeline"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full hover:shadow-lg transition-shadow"
          >
            ← חזרה לטיימליין
          </a>
        </div>
      </div>
    </div>
  );
}
