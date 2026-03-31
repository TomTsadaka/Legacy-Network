'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname })
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [pathname]);

  return null; // This component doesn't render anything
}
