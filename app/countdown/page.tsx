import type { Metadata } from 'next';
import Link from 'next/link';
import MorningCountdown from '@/components/MorningCountdown';
import { MORNING_HOUR } from '@/lib/morning-countdown';

export const metadata: Metadata = {
  title: 'ספירה לאחור עד 6:00 בבוקר | Legacy Network',
  description: 'הקישו תאריך וגלו כמה ימים, שעות ודקות נותרו עד 6:00 בבוקר באותו יום',
};

export default function CountdownPage() {
  return (
    <div className="min-h-screen bg-stone-50 px-6 py-20 sm:py-28" dir="rtl">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-light tracking-tight text-stone-900">
          עד {MORNING_HOUR}:00 בבוקר
        </h1>
        <p className="mt-3 text-sm text-stone-400">
          בחרו תאריך ונציג כמה ימים, שעות ודקות נותרו
        </p>

        <div className="mx-auto my-14 h-px w-10 bg-stone-200" />

        <MorningCountdown />

        <Link
          href="/"
          className="mt-20 inline-block text-sm text-stone-400 transition-colors hover:text-stone-900"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
