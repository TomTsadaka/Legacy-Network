import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Dashboard is now deprecated, redirect to timeline
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }
  
  // Redirect authenticated users to timeline
  redirect('/timeline');
}
