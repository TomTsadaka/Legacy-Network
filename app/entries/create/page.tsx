'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CreateEntryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('DAILY_LIFE');
  const [location, setLocation] = useState('');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [family, setFamily] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadFamily();
    }
  }, [status]);

  async function loadFamily() {
    try {
      const res = await fetch('/api/families');
      const data = await res.json();

      if (data.families && data.families.length > 0) {
        const primaryFamily = data.families[0];
        setFamily(primaryFamily);
        
        const childrenRes = await fetch(`/api/children?familyId=${primaryFamily.id}`);
        const childrenData = await childrenRes.json();
        setChildren(childrenData.children || []);
      }
    } catch (error) {
      console.error('Error loading family:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          eventDate,
          category,
          location: location || undefined,
          familyId: family.id,
          childrenIds: selectedChildren,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create entry');
      }

      router.push('/timeline');
    } catch (err: any) {
      setError(err.message || 'משהו השתבש');
    } finally {
      setLoading(false);
    }
  }

  function toggleChild(childId: string) {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  }

  if (status === 'loading' || !family) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-purple-200 border-t-purple-500 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-purple-700 font-bold text-lg">מכין את הקסם...</p>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'MILESTONE', label: 'אבן דרך', emoji: '⭐', color: 'from-purple-400 to-pink-400' },
    { value: 'DAILY_LIFE', label: 'יומי', emoji: '☀️', color: 'from-yellow-400 to-orange-400' },
    { value: 'SPECIAL_EVENT', label: 'אירוע מיוחד', emoji: '🎉', color: 'from-pink-400 to-red-400' },
    { value: 'HEALTH', label: 'בריאות', emoji: '💊', color: 'from-green-400 to-teal-400' },
    { value: 'EDUCATION', label: 'חינוך', emoji: '📚', color: 'from-blue-400 to-indigo-400' },
    { value: 'FAMILY', label: 'משפחה', emoji: '👨‍👩‍👧‍👦', color: 'from-orange-400 to-yellow-400' },
    { value: 'TRAVEL', label: 'טיול', emoji: '✈️', color: 'from-cyan-400 to-blue-400' },
    { value: 'OTHER', label: 'אחר', emoji: '🌈', color: 'from-gray-400 to-gray-500' },
  ];

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/timeline')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-bold transition-all hover:gap-3"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לציר הזמן
          </button>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              זיכרון קסום חדש
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <p className="text-purple-600 font-medium text-lg">שתף רגע מיוחד שישאר לנצח! ✨</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-playful p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              כותרת הזיכרון *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="למשל: הצעד הראשון של עילאי ורוי! 👣"
              className="input-playful text-lg"
            />
          </div>

          {/* Event Date */}
          <div>
            <label htmlFor="eventDate" className="block text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              תאריך האירוע *
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="input-playful text-lg"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">🏷️</span>
              קטגוריה
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`
                    p-4 rounded-2xl border-3 font-bold transition-all
                    ${
                      category === cat.value
                        ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                        : 'bg-white border-purple-200 text-purple-700 hover:border-purple-400 hover:shadow-md'
                    }
                  `}
                >
                  <div className="text-3xl mb-1">{cat.emoji}</div>
                  <div className="text-sm">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Children */}
          {children.length > 0 && (
            <div>
              <label className="block text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
                <span className="text-2xl">👶</span>
                תייג ילדים
              </label>
              <div className="flex flex-wrap gap-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleChild(child.id)}
                    className={`
                      px-6 py-3 rounded-full border-3 font-bold transition-all text-lg
                      ${
                        selectedChildren.includes(child.id)
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400 border-blue-500 text-white shadow-lg scale-105'
                          : 'bg-white border-purple-300 text-purple-700 hover:border-purple-500 hover:shadow-md'
                      }
                    `}
                  >
                    👶 {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              מיקום (אופציונלי)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="למשל: פארק הירקון, תל אביב 🌳"
              className="input-playful text-lg"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">📖</span>
              ספר לנו על הרגע המיוחד *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              placeholder="כתוב את הזיכרון הקסום שלך כאן... 🌟"
              className="input-playful text-lg resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-purple-600 font-medium">
                {content.length} תווים
              </p>
              {content.length > 50 && (
                <p className="text-sm text-green-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  נהדר! ממשיך ככה!
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary-playful text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  שומר...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  שמור זיכרון קסום!
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/timeline')}
              className="btn-secondary-playful text-lg"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>

      {/* Floating decorations */}
      <div className="fixed top-1/4 left-10 text-6xl opacity-20 animate-float pointer-events-none">
        🎈
      </div>
      <div className="fixed bottom-1/4 right-10 text-6xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>
        ⭐
      </div>
    </div>
  );
}
