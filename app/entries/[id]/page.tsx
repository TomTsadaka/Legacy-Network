'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Calendar, MapPin, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export default function EntryViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadEntry();
    }
  }, [status, id]);

  async function loadEntry() {
    try {
      const res = await fetch(`/api/entries/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setEntry(data.entry);
    } catch (error) {
      console.error('Error loading entry:', error);
      router.push('/timeline');
    } finally {
      setLoading(false);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
          </div>
          <p className="text-blue-700 font-bold text-lg">טוען זיכרון קסום...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  const categoryStyles: any = {
    MILESTONE: { emoji: '⭐', color: 'from-purple-400 to-pink-400', border: 'border-purple-300', text: 'text-purple-700' },
    DAILY_LIFE: { emoji: '☀️', color: 'from-yellow-400 to-orange-400', border: 'border-yellow-300', text: 'text-yellow-700' },
    SPECIAL_EVENT: { emoji: '🎉', color: 'from-pink-400 to-red-400', border: 'border-pink-300', text: 'text-pink-700' },
    HEALTH: { emoji: '💊', color: 'from-green-400 to-teal-400', border: 'border-green-300', text: 'text-green-700' },
    EDUCATION: { emoji: '📚', color: 'from-blue-400 to-indigo-400', border: 'border-blue-300', text: 'text-blue-700' },
    FAMILY: { emoji: '👨‍👩‍👧‍👦', color: 'from-orange-400 to-yellow-400', border: 'border-orange-300', text: 'text-orange-700' },
    TRAVEL: { emoji: '✈️', color: 'from-cyan-400 to-blue-400', border: 'border-cyan-300', text: 'text-cyan-700' },
    OTHER: { emoji: '🌈', color: 'from-gray-400 to-gray-500', border: 'border-gray-300', text: 'text-gray-700' },
  };

  const categoryLabels: any = {
    MILESTONE: 'אבן דרך',
    DAILY_LIFE: 'יומי',
    SPECIAL_EVENT: 'אירוע מיוחד',
    HEALTH: 'בריאות',
    EDUCATION: 'חינוך',
    FAMILY: 'משפחה',
    TRAVEL: 'טיול',
    OTHER: 'אחר',
  };

  const style = categoryStyles[entry.category] || categoryStyles.OTHER;
  const label = categoryLabels[entry.category] || 'אחר';

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => router.push('/timeline')}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2 font-bold transition-all hover:gap-3"
        >
          <ArrowRight className="w-5 h-5" />
          חזרה לציר הזמן
        </button>

        {/* Entry Card */}
        <div className={`card-playful p-6 md:p-8 border-r-8 ${style.border}`}>
          {/* Decorative emoji */}
          <div className="absolute top-4 left-4 text-4xl md:text-5xl opacity-30 animate-pulse">
            {style.emoji}
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-3 flex-1 pr-12">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 flex-shrink-0" />
                {entry.title}
              </h1>

              {/* Category badge */}
              <span
                className={`
                  px-4 py-2 rounded-full text-sm font-bold border-2 shadow-md flex-shrink-0
                  bg-gradient-to-br ${style.color} ${style.border} text-white
                  flex items-center gap-2
                `}
              >
                <span className="text-lg">{style.emoji}</span>
                <span className="hidden md:inline">{label}</span>
              </span>
            </div>

            {/* Children tags */}
            {entry.children && entry.children.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.children.map((child: any) => (
                  <span
                    key={child.id}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md"
                  >
                    👶 {child.name}
                    {child.ageAtEntry && (
                      <span className="mr-2 text-xs opacity-90">
                        • {child.ageAtEntry}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Date & Location */}
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {new Date(entry.eventDate).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {entry.location && (
                <div className="flex items-center gap-2 bg-cyan-50 px-3 py-2 rounded-full">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium text-cyan-800">{entry.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
              {entry.content}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t-2 border-blue-100 text-sm text-gray-500">
            נוסף {formatDistanceToNow(new Date(entry.createdAt), {
              addSuffix: true,
              locale: he,
            })}
          </div>
        </div>
      </div>

      {/* Floating decorations */}
      <div className="fixed top-1/4 left-10 text-6xl opacity-20 animate-float pointer-events-none hidden md:block">
        🎈
      </div>
      <div className="fixed bottom-1/4 right-10 text-6xl opacity-20 animate-float pointer-events-none hidden md:block" style={{ animationDelay: '1.5s' }}>
        ⭐
      </div>
    </div>
  );
}
