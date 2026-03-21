import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getUpcomingBirthdays } from '@/lib/age-calculator';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get authenticated user
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser) {
    return <div>User not found. Please sign in again.</div>;
  }

  // Get user's family
  const familyMember = await prisma.familyMember.findFirst({
    where: { userId: currentUser.id },
    include: {
      family: {
        include: {
          children: {
            orderBy: { birthDate: 'desc' },
          },
          entries: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              taggedChildren: {
                include: {
                  child: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!familyMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Legacy Network!</h1>
          <p className="text-gray-600 mb-4">Your admin account is ready, but you need to complete setup first.</p>
          <a href="/onboarding" className="btn-primary">Complete Setup</a>
        </div>
      </div>
    );
  }

  const { family } = familyMember;
  const upcomingBirthdays = getUpcomingBirthdays(family.children, 30);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-serif font-bold text-primary">
              Legacy Network
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {currentUser.name}!
                {currentUser.role === 'SUPER_ADMIN' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Super Admin</span>}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold mb-2">{family.name}</h2>
          <p className="text-gray-600">
            {family.children.length} {family.children.length === 1 ? 'child' : 'children'} · {' '}
            {family.entries.length} {family.entries.length === 1 ? 'memory' : 'memories'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/entry/new" className="btn-primary block text-center">
                📝 Add Memory
              </a>
              <a href="/children/new" className="btn-secondary block text-center">
                👶 Add Child
              </a>
              <a href="/feed" className="btn-secondary block text-center">
                📅 View Timeline
              </a>
            </div>
          </div>

          {/* Upcoming Birthdays */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">🎂 Upcoming Birthdays</h3>
            {upcomingBirthdays.length > 0 ? (
              <div className="space-y-3">
                {upcomingBirthdays.map((child) => (
                  <div key={child.id} className="p-3 bg-cream rounded-lg">
                    <div className="font-semibold">{child.name}</div>
                    <div className="text-sm text-gray-600">
                      {child.daysUntil === 0 ? (
                        <span className="text-primary font-bold">Today!</span>
                      ) : (
                        <>In {child.daysUntil} days · Turning {child.age}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No birthdays in the next 30 days</p>
            )}
          </div>

          {/* Recent Memories */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">💝 Recent Memories</h3>
            {family.entries.length > 0 ? (
              <div className="space-y-3">
                {family.entries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-cream rounded-lg">
                    <div className="font-semibold text-sm mb-1">{entry.title}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(entry.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📝</div>
                <p>No memories yet</p>
                <p className="text-sm">Start documenting your journey!</p>
              </div>
            )}
          </div>
        </div>

        {/* Children Grid */}
        <div className="mt-8">
          <h3 className="text-2xl font-serif font-bold mb-4">Your Children</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {family.children.map((child) => (
              <div key={child.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    {child.gender === 'MALE' ? '👦' : child.gender === 'FEMALE' ? '👧' : '👶'}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{child.name}</h4>
                    <p className="text-sm text-gray-600">
                      Born {new Date(child.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
