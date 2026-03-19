export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/feed/:path*',
    '/api/family/:path*',
    '/api/children/:path*',
    '/api/entries/:path*',
  ],
};
