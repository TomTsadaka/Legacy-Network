import type { Metadata } from 'next';
import Link from 'next/link';
import { Sunrise, ChevronRight } from 'lucide-react';
import MorningCountdown from '@/components/MorningCountdown';

export const metadata: Metadata = {
  title: 'ספירה לאחור עד 6:00 בבוקר | Legacy Network',
  description: 'הקישו תאריך וגלו כמה ימים, שעות ודקות נותרו עד 6:00 בבוקר באותו יום',
};

export default function CountdownPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900" dir="rtl">
      {/* רקע מונפש */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-blue-100 hover:text-white transition-colors mb-8 font-semibold"
          >
            <ChevronRight className="w-5 h-5" />
            חזרה לדף הבית
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6 text-white/90 text-sm">
              <Sunrise className="w-4 h-4 text-amber-300" />
              <span>ספירה לאחור לבוקר</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
                כמה נותר עד 6:00 בבוקר?
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 font-light">
              הקישו תאריך ונציג בעברית כמה ימים, שעות ודקות נותרו עד 6:00 בבוקר באותו יום
            </p>
          </div>

          <MorningCountdown />
        </div>
      </div>
    </div>
  );
}
